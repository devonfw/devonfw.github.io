const core = require("@actions/core");
const { Octokit } = require("@octokit/core");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function selectChangedFiles() {
    let pr = process.env.PR_NUMBER;
    let arr = [];
    try {
        let get = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/files', {
            owner: process.env.PR_OWNER,
            repo:  process.env.PR_REPO,
            pull_number: pr
        });
        let files = get.data;
        files.forEach(file => {
            arr.push(file.filename)
        });
    } catch(e) {
        throw e;
    }
    let output = arr.join(' ');
    core.info(`Changed Files: ${output}`);
    core.setOutput('changedFiles', output);
}

selectChangedFiles().catch(err => {
    console.log(err);
    process.exit(1); 
});
