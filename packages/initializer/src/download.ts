/*
Adapted from https://github.com/Gyumeijie/github-files-fetcher
Credit to: Gyumeijie

MIT License
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const fs = require("fs");
const fse = require("fs-extra");
const url = require("url");
const axios = require("axios");
const util = require("util");
const setTimeoutPromise = util.promisify(setTimeout);

const AUTHOR = 1;
const REPOSITORY = 2;
const BRANCH = 4;

const pathCache = [];

let repoInfo: any = {};

let outputDirectory = `${process.cwd()}`;
let localRootDirectory = "";

const basicOptions = {
  method: "get",
  responseType: "arrayBuffer",
};

function preprocessURL(repoURL) {
  const len = repoURL.length;
  if (repoURL[len - 1] === "/") {
    return repoURL.slice(0, len - 1);
  }

  return repoURL;
}

function parseInfo(repoInfo) {
  const repoURL = preprocessURL(repoInfo.url);
  const repoPath = url.parse(repoURL, true).pathname;
  const splitPath = repoPath.split("/");
  const info: any = {};

  info.author = splitPath[AUTHOR];
  info.repository = splitPath[REPOSITORY];
  info.branch = splitPath[BRANCH];
  info.rootName = splitPath[splitPath.length - 1];

  // Common parts of url for downloading
  info.urlPrefix = `https://api.github.com/repos/${info.author}/${info.repository}/contents/`;
  info.urlPostfix = `?ref=${info.branch}`;

  if (splitPath[BRANCH]) {
    info.resPath = repoPath.substring(
      repoPath.indexOf(splitPath[BRANCH]) + splitPath[BRANCH].length + 1
    );
  }

  if (!repoInfo.fileName || repoInfo.fileName === "") {
    info.downloadFileName = info.rootName;
  } else {
    info.downloadFileName = repoInfo.fileName;
  }

  if (repoInfo.rootDirectory === "false") {
    info.rootDirectoryName = "";
  } else if (
    !repoInfo.rootDirectory ||
    repoInfo.rootDirectory === "" ||
    repoInfo.rootDirectory === "true"
  ) {
    info.rootDirectoryName = `${info.rootName}/`;
  } else {
    info.rootDirectoryName = `template/`;
  }

  if (repoInfo.to && fs.existsSync(repoInfo.to)) {
    if (repoInfo.to[repoInfo.to.length - 1] !== "/")
      repoInfo.to = repoInfo.to + "/";
    outputDirectory = repoInfo.to;
  }

  return info;
}

function extractFilenameAndDirectoryFrom(path) {
  const components = path.split("/");
  const filename = components[components.length - 1];
  const directory = path.substring(0, path.length - filename.length);

  return {
    filename,
    directory,
  };
}

function downloadFile(url, pathname) {
  return new Promise((resolve, reject) => {
    axios({
      ...basicOptions,
      responseType: "stream",
      url,
    })
      .then(async (response) => {
        if (pathCache.indexOf(pathname.directory) === -1) {
          await fse.mkdirp(pathname.directory);
          pathCache.push(pathname.directory);
        }

        const localPathname = pathname.directory + pathname.filename;
        response.data
          .pipe(fs.createWriteStream(localPathname))
          .on("error", (error) => {})
          .on("close", () => {
            // TODO: logger log
            //   console.log("download file", pathname.filename);
            resolve();
          });
      })
      .catch((error) => {
        console.log("Error downloading file:", error);
        reject(error);
      });
  });
}

function removeResPathFrom(path) {
  return path.substring(decodeURI(repoInfo.resPath).length + 1);
}

function constructLocalPathname(repoPath) {
  const partialPath = extractFilenameAndDirectoryFrom(
    removeResPathFrom(repoPath)
  );
  localRootDirectory = outputDirectory + repoInfo.rootDirectoryName;
  const localDirectory = localRootDirectory + partialPath.directory;

  return {
    filename: partialPath.filename,
    directory: localDirectory,
  };
}

function processResponse(response, dirPaths) {
  return new Promise((resolve, reject) => {
    const { data } = response;
    for (let i = 0; i < data.length; i++) {
      if (data[i].type === "dir") {
        dirPaths.push(data[i].path);
      } else if (data[i].download_url) {
        const pathname = constructLocalPathname(data[i].path);
        // Using a timeout to avoid rate limiting from Github
        setTimeoutPromise((i + 1) * 1000).then(async (value) => {
          const dl = await downloadFile(data[i].download_url, pathname);
          if (dl) resolve();
        });
      } else {
        console.log("Error:", data[i]);
        reject();
      }
    }
  });
}

function iterateDirectory(dirPaths) {
  return new Promise((resolve, reject) => {
    axios({
      ...basicOptions,
      url: repoInfo.urlPrefix + dirPaths.pop() + repoInfo.urlPostfix,
    })
      .then(async (response) => {
        const prRes = await processResponse(response, dirPaths);
        if (prRes) {
          resolve();
        }
      })
      .catch((error) => {
        console.log("Error iterating Github directory:", error);
      });
  });
}

function downloadDirectory(data) {
  return new Promise(async (resolve, reject) => {
    const dirPaths = [];
    dirPaths.push(repoInfo.resPath);
    processResponse(data, dirPaths);
    while (dirPaths.length !== 0) {
      await iterateDirectory(dirPaths);
    }
    resolve();
  });
}

export function githubDownload(paras): Promise<Boolean> {
  return new Promise((resolve, reject) => {
    repoInfo = parseInfo(paras);
    // Download part(s) of repository
    console.log(outputDirectory, "output dir");
    axios({
      ...basicOptions,
      url: repoInfo.urlPrefix + repoInfo.resPath + repoInfo.urlPostfix,
    })
      .then(async (response) => {
        if (response.data instanceof Array) {
          const { data } = response;
          const dlDir = await downloadDirectory(data);
          if (dlDir) resolve();
        } else {
          const partialPath = extractFilenameAndDirectoryFrom(
            decodeURI(repoInfo.resPath)
          );
          downloadFile(response.data.download_url, {
            ...partialPath,
            directory: outputDirectory,
          });
          localRootDirectory = outputDirectory;
          resolve(true);
        }
      })
      .catch((error) => {
        console.log("Error contacting Github:", error);
        reject(false);
      });
  });
}
