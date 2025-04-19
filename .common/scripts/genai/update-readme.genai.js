script({
  title: "Update readme",
  description: "Update the readme file of a sample",
  model: "large",
  group: "samples",
  system: "system.files",
});

def("README", env.files, { glob: "**/README.md" });
def("FILE", env.files, { glob: "**/*.ts, package.json" });

$`## Role
You're a Principal Developer Advocate working at Microsoft, expert in software engineering and open source. You are responsible for maintaining the README file of a project. Your task is to update the README file to match the code for the sample project provided in the <FILE>.

## Task
1. Read the README file and the code in <FILE>.
2. Update the README file keeping all the template sections in the provided README file. Some sections may already be filled, but you need to make sure that the README file is up to date with the code in <FILE>.
3. If needed, you can add subsections to the existing sections to details the key points and behavior of the project.

## Instructions
- Keep the README file in markdown format and leave untouched the sections that are generated or not relevant to the code in <FILE>.
- Keep it easy to read and with the same tone of voice as the original README file.
- Update the frontmatter properties like title, description
- Do not alter commented out sections, or update content where you don't have enough information (like blog posts link or Youtube video links)
- Do not make up information, if you don't know something, ask the user for clarification or leave it blank.
`;
