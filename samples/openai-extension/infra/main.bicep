targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
// Flex Consumption functions are only supported in these regions.
// Run `az functionapp list-flexconsumption-locations --output table` to get the latest list
@allowed([
  'northeurope'
  'southeastasia'
  'eastasia'
  'eastus2'
  'southcentralus'
  'australiaeast'
  'eastus'
  'westus2'
  'uksouth'
  'eastus2euap'
  'westus3'
  'swedencentral'
])
param location string

param resourceGroupName string = ''
param apiServiceName string = 'api'

@description('Location for the OpenAI resource group')
@allowed([
  'australiaeast'
  'canadaeast'
  'eastus'
  'eastus2'
  'francecentral'
  'japaneast'
  'northcentralus'
  'swedencentral'
  'switzerlandnorth'
  'uksouth'
  'westeurope'
])
@metadata({
  azd: {
    type: 'location'
  }
})
param openAiLocation string // Set in main.parameters.json
param openAiApiVersion string // Set in main.parameters.json
param chatModelName string // Set in main.parameters.json
param chatModelVersion string // Set in main.parameters.json
param chatModelCapacity int // Set in main.parameters.json
param embeddingsModelName string // Set in main.parameters.json
param embeddingsModelVersion string // Set in main.parameters.json
param embeddingsModelCapacity int // Set in main.parameters.json

// Id of the user or app to assign application roles
param principalId string = ''

// Differentiates between automated and manual deployments
param isContinuousDeployment bool // Set in main.parameters.json

// ---------------------------------------------------------------------------
// Services configuration

var services = loadJsonContent('services.json')

// Enable enhanced security with VNet integration
var useVnet = services.?useVnet ?? false
// Enable Azure OpenAI deployment
var useOpenAi = services.?useOpenAi ?? false
// Enable Blob storage for the Azure Functions API
var useBlobStorage = services.?useBlobStorage ?? false

// ---------------------------------------------------------------------------

var abbrs = loadJsonContent('abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = { 'azd-env-name': environmentName }

var apiResourceName = '${abbrs.webSitesFunctions}api-${resourceToken}'
var storageAccountName = '${abbrs.storageStorageAccounts}${resourceToken}'
var openAiUrl = useOpenAi ? 'https://${openAi.outputs.name}.openai.azure.com' : ''
// var storageUrl = 'https://${storage.outputs.name}.blob.${environment().suffixes.storage}'

// Organize resources in a resource group
resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

module function 'br/public:avm/res/web/site:0.13.0' = {
  name: 'api'
  scope: resourceGroup
  params: {
    tags: union(tags, { 'azd-service-name': apiServiceName })
    location: location
    kind: 'functionapp,linux'
    name: apiResourceName
    serverFarmResourceId: appServicePlan.outputs.resourceId
    // appInsightResourceId: '<appInsightResourceId>'
    managedIdentities: { systemAssigned: true }
    appSettingsKeyValuePairs: union(
      {
        // APPINSIGHTS_INSTRUMENTATIONKEY: monitoring.outputs.applicationInsightsInstrumentationKey
      },
      useOpenAi
        ? {
            AZURE_OPENAI_ENDPOINT: openAiUrl
            AZURE_OPENAI_CHAT_DEPLOYMENT_NAME: chatModelName
            AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT_NAME: embeddingsModelName
            AZURE_OPENAI_INSTANCE_NAME: openAi.outputs.name
            AZURE_OPENAI_API_VERSION: openAiApiVersion
          }
        : {}
    )
    siteConfig: {}
    functionAppConfig: {
      deployment: {
        storage: {
          type: 'blobContainer'
          value: '${storage.outputs.primaryBlobEndpoint}${apiResourceName}'
          authentication: {
            type: 'SystemAssignedIdentity'
          }
        }
      }
      scaleAndConcurrency: {
        maximumInstanceCount: 800
        instanceMemoryMB: 2048
      }
      runtime: {
        name: 'node'
        version: '20'
      }
    }
    storageAccountResourceId: storage.outputs.resourceId
  }
}

module appServicePlan 'br/public:avm/res/web/serverfarm:0.4.1' = {
  name: 'appserviceplan'
  scope: resourceGroup
  params: {
    name: '${abbrs.webServerFarms}${resourceToken}'
    tags: tags
    location: location
    skuName: 'FC1'
    reserved: true
  }
}

module storage 'br/public:avm/res/storage/storage-account:0.15.0' = {
  name: 'storage'
  scope: resourceGroup
  params: {
    name: storageAccountName
    tags: tags
    location: location
    kind: 'BlobStorage'
    allowSharedKeyAccess: !useVnet
    blobServices: {
      containers: [
        {
          name: apiResourceName
        }
      ]
    }
  }
}

// // Monitor application with Azure Monitor
// module monitoring './core/monitor/monitoring.bicep' = {
//   name: 'monitoring'
//   scope: resourceGroup
//   params: {
//     location: location
//     tags: tags
//     logAnalyticsName: '${abbrs.operationalInsightsWorkspaces}${resourceToken}'
//     applicationInsightsName: '${abbrs.insightsComponents}${resourceToken}'
//     applicationInsightsDashboardName: '${abbrs.portalDashboards}${resourceToken}'
//   }
// }

module openAi 'br/public:avm/res/cognitive-services/account:0.9.1' = {
  name: 'openai'
  scope: resourceGroup
  params: {
    name: '${abbrs.cognitiveServicesAccounts}${resourceToken}'
    tags: tags
    location: openAiLocation
    kind: 'OpenAI'
    disableLocalAuth: true
    customSubDomainName: '${abbrs.cognitiveServicesAccounts}${resourceToken}'
    publicNetworkAccess: 'Enabled'
    deployments: [
      {
        name: chatModelName
        model: {
          format: 'OpenAI'
          name: chatModelName
          version: chatModelVersion
        }
        sku: {
          capacity: chatModelCapacity
          name: 'GlobalStandard'
        }
      }
      {
        name: embeddingsModelName
        model: {
          format: 'OpenAI'
          name: embeddingsModelName
          version: embeddingsModelVersion
        }
        sku: {
          capacity: embeddingsModelCapacity
          name: 'Standard'
        }
      }
    ]
  }
}

// module openAi 'core/ai/cognitiveservices.bicep' = if (useOpenAi) {
//   name: 'openai'
//   scope: resourceGroup
//   params: {
//     name: '${abbrs.cognitiveServicesAccounts}${resourceToken}'
//     location: openAiLocation
//     tags: tags
//     sku: {
//       name: openAiSkuName
//     }
//     disableLocalAuth: true
//     deployments: [
//       {
//         name: chatDeploymentName
//         model: {
//           format: 'OpenAI'
//           name: chatModelName
//           version: chatModelVersion
//         }
//         sku: {
//           name: 'GlobalStandard'
//           capacity: chatDeploymentCapacity
//         }
//       }
// {
//   name: embeddingsDeploymentName
//   model: {
//     format: 'OpenAI'
//     name: embeddingsModelName
//     version: embeddingsModelVersion
//   }
//   capacity: embeddingsDeploymentCapacity
// }
//     ]
//   }
// }

// module cosmosDb 'br/public:avm/res/document-db/database-account:0.9.0' = {
//   name: 'cosmosDb'
//   scope: resourceGroup
//   params: {
//     name: !empty(cosmosDbServiceName) ? cosmosDbServiceName : '${abbrs.documentDBDatabaseAccounts}${resourceToken}'
//     tags: tags
//     locations: [
//       {
//         locationName: location
//         failoverPriority: 0
//         isZoneRedundant: false
//       }
//     ]
//     managedIdentities: {
//       systemAssigned: true
//     }
//     capabilitiesToAdd: [
//       'EnableServerless'
//       'EnableNoSQLVectorSearch'
//     ]
//     networkRestrictions: {
//       ipRules: []
//       virtualNetworkRules: []
//       publicNetworkAccess: 'Enabled'
//     }
//     sqlDatabases: [
//       {
//         containers: [
//           {
//             name: 'vectorSearchContainer'
//             paths: [
//               '/id'
//             ]
//           }
//         ]
//         name: 'vectorSearchDB'
//       }
//       {
//         containers: [
//           {
//             name: 'chatHistoryContainer'
//             paths: [
//               '/userId'
//             ]
//           }
//         ]
//         name: 'chatHistoryDB'
//       }
//     ]
//   }
// }

// module dbRoleDefinition './core/database/cosmos/sql/cosmos-sql-role-def.bicep' = {
//   scope: resourceGroup
//   name: 'db-contrib-role-definition'
//   params: {
//     accountName: cosmosDb.outputs.name
//   }
// }

// Managed identity roles assignation
// ---------------------------------------------------------------------------

// User roles
module openAiRoleUser 'core/security/role.bicep' = if (!isContinuousDeployment) {
  scope: resourceGroup
  name: 'openai-role-user'
  params: {
    principalId: principalId
    // Cognitive Services OpenAI User
    roleDefinitionId: '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd'
    principalType: 'User'
  }
}

// module dbContribRoleUser './core/database/cosmos/sql/cosmos-sql-role-assign.bicep' = if (!isContinuousDeployment) {
//   scope: resourceGroup
//   name: 'db-contrib-role-user'
//   params: {
//     accountName: cosmosDb.outputs.name
//     principalId: principalId
//     // Cosmos DB Data Contributor
//     roleDefinitionId: dbRoleDefinition.outputs.id
//   }
// }

// System roles
module openAiRoleApi 'core/security/role.bicep' = {
  scope: resourceGroup
  name: 'openai-role-api'
  params: {
    principalId: function.outputs.systemAssignedMIPrincipalId
    // Cognitive Services OpenAI User
    roleDefinitionId: '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd'
    principalType: 'ServicePrincipal'
  }
}

// module dbContribRoleApi './core/database/cosmos/sql/cosmos-sql-role-assign.bicep' = {
//   scope: resourceGroup
//   name: 'db-contrib-role-api'
//   params: {
//     accountName: cosmosDb.outputs.name
//     principalId: api.outputs.identityPrincipalId
//     // Cosmos DB Data Contributor
//     roleDefinitionId: dbRoleDefinition.outputs.id
//   }
// }

output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output AZURE_RESOURCE_GROUP string = resourceGroup.name

output API_URL string = useVnet ? '' : function.outputs.defaultHostname

output AZURE_OPENAI_ENDPOINT string = openAiUrl
output AZURE_OPENAI_CHAT_DEPLOYMENT_NAME string = chatModelName
output AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT_NAME string = embeddingsModelName
output AZURE_OPENAI_INSTANCE_NAME string = openAi.outputs.name
output AZURE_OPENAI_API_VERSION string = openAiApiVersion

// output AZURE_STORAGE_URL string = storageUrl
// output AZURE_STORAGE_CONTAINER_NAME string = blobContainerName
// output AZURE_COSMOSDB_NOSQL_ENDPOINT string = cosmosDb.outputs.endpoint
