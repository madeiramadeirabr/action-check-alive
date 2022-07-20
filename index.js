const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');
const { Octokit } = require("@octokit/core");


async function getUrlFile(branch, pathFile, githubToken) {
    const octokit = new Octokit({
        auth: githubToken
    })

    const owner = github.context.payload.repository.owner.name
    const repo = github.context.payload.repository.name

    try {
        let res = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: owner,
            repo: repo,
            path: pathFile,
            ref: branch
        });
        return res.data.download_url;
    } catch (error) {
        throw new Error("Arquivo não encontrado");
    }
}

function checkAlive(content) {
    let pattern = /(\/alive|alive)/i;
    return pattern.test(content);

}

async function getContetFile(downloadFile, githubToken) {
    try {
        return axios.get(downloadFile, { headers: { Authorization: `Bearer ${githubToken}` } });
    } catch (error) {
        throw new Error("Erro ao obter o conteúdo do arquivo");
    }
}




async function run() {
    try {
        const pathFile = core.getInput('path-file');
        const branch = core.getInput('branch');
        const githubToken = core.getInput('github-token');


        if (!pathFile) {
            throw new Error("path-file é obrigatório");
        }

        if (!githubToken) {
            throw new Error("github-token é obrigatório");
        }

        if (!branch) {
            throw new Error("branch é obrigatório");
        }

        let downloadFile = await getUrlFile(branch, pathFile, githubToken);

        let content = await getContetFile(downloadFile, githubToken);


        if (!checkAlive(content.data)) {
            throw new Error("Rota alive não encontrada");
        }

        core.setOutput('result', "Rota alive encontrada");
        console.log("Rota alive encontrada");


    } catch (error) {
        core.setFailed(error.message);
        console.log(error.message);
    }
}


run();