const fs = require('fs')
const readline  = require('readline')
const googleapis = require('googleapis')

class ClientDrive {
    constructor(opts){
        this.scopes = opts.scopes,
        this.token_path = opts.tokenPath,
        this.credentials_path = opts.credentialsPath,
        this.parent_folder_id={}
    }

    async getCredentials() {
        return fs.readFileSync(this.credentials_path).toString();
    }
    async getToken() {
        return fs.readFileSync(this.token_path).toString();
    }

    getAccessToken(oAuth2Client) {
        return new Promise((resolve, reject) => {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: this.scopes,
            });
            console.log('Authorize this app by visiting this url:', authUrl);
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            rl.question('Enter the code from that page here: ', (code) => {
                rl.close();
                oAuth2Client.getToken(code, (err, token) => {
                    console.log(token,'code',code)
                    if (err) {
                        reject(err);
                    }
                    
                    // Store the token to disk for later program executions
                    try {
                        fs.writeFileSync(this.token_path, JSON.stringify(token));
                    }
                    catch (err) {
                        reject(err);
                    }
                    resolve(JSON.stringify(token));
                    
                });
            });
        });
    }

    authorize(credentials) {
        return new Promise(async (resolve, reject) => {
            const { client_secret, client_id, redirect_uris } = credentials.installed;
            const oAuth2Client = new googleapis.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
            // Check if we have previously stored a token.
            let token = await this.getToken().catch(err => { });
            if (!token) {
                token = await this.getAccessToken(oAuth2Client).catch(err => reject(err));
            }
            oAuth2Client.setCredentials(JSON.parse(token));
            resolve(oAuth2Client);
        });
    }
    
    async connectDrive() {
        const credentials = await this.getCredentials().catch(err => { throw err; });
        if (!credentials) {
            return null;
        }
        const auth = await this
            .authorize(JSON.parse(credentials))
            .catch(err => { throw err; });
        return auth;
    }

    async getDriveInstance() {
        const auth = await this
            .connectDrive()
            .catch(err => { throw err; });
        if (!auth) {
            return null;
        }
        const drive = googleapis.google.drive({ version: 'v3', auth });
        return drive;
    }
    getFolderId(folderName) {
        return new Promise(async (resolve, reject) => {
            const drive = await this
                .getDriveInstance()
                .catch(err => reject(err));
            if (!drive) {
                return resolve(null);
            }
            drive.files.list({
                q: "mimeType='application/vnd.google-apps.folder'",
                fields: 'nextPageToken, files(id, name)',
                spaces: 'drive',
            }, (err, res) => {
                if (err) {
                    reject(err);
                }
                else {
                    !res && resolve(null);
                    const needFile = res.data.files.filter((file) => file.name === folderName)[0];
                    resolve(needFile ? needFile.id : null);
                }
            });
        });

    }

    async getParentFolderId(folderName) {
        if (!this.parent_folder_id[folderName]) {
            const folderId = await this.getFolderId(folderName).catch(err => { throw err; });
            folderId && (this.parent_folder_id[folderName] = folderId);
        }
        return this.parent_folder_id[folderName];
    }

    uploadFile(options) {
        return new Promise(async (resolve, reject) => {
            const { toFolder, filename, mimeType, fileUrl, permissions, folderId } = options;
            const drive = await this.getDriveInstance().catch(err => reject(err));
            const parentId = folderId || (toFolder ? await this.getParentFolderId(toFolder) : null);
            const fileMetadata = {
                name: filename,
                parents: parentId ? [parentId] : []
            };
            const media = {
                mimeType: mimeType,
                // body: fs.createReadStream('./arrow.png')
                body: fs.createReadStream(fileUrl)
            };
            if (!drive) {
                return reject({ message: 'can not generate drive instance' });
            }
            drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id, name, webContentLink'
            }, async (err, file) => {
                if (err) {
                    reject(err);
                }
                else {
                    permissions && await this
                        .addPermissions(file.data.id, permissions)
                        .catch(err => reject(err));
                    resolve({
                        downloadUrl: file.data.webContentLink,
                        fileId: file.data.id
                    });
                }
            });
        });
    }
    async deleteFile(fileId) {
        return new Promise(async (resolve, reject) => {
            const drive = await this.getDriveInstance().catch(err => reject(err));
            if (!drive) {
                return reject({ message: 'can not generate drive instance' });
            }
            drive.files.delete({
                fileId
            }, (err, res) => {
                if (err) {
                    reject(err);
                }
                resolve({
                    fileId
                });
            });
        });
    }
    async addPermission(fileId, permission) {
        return new Promise(async (resolve, reject) => {
            const drive = await this.getDriveInstance().catch(err => reject(err));
            if (!drive) {
                return reject({ message: 'can not generate drive instance' });
            }
            drive.permissions.create({
                requestBody: permission,
                fileId: fileId,
                fields: 'id',
            }, (err, res) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        fileId,
                        permissionId: res.data.id
                    });
                }
            });
        });
    }

    async addPermissions(fileId, permissions) {
        return new Promise(async (resolve, reject) => {
            Promise
                .all(permissions.map(async (permission) => {
                return await this.addPermission(fileId, permission).catch(err => reject(err));
            }))
                .then((values) => {
                resolve(values);
            })
                .catch(err => {
                reject(err);
            });
        });
    }
}

exports.ClientDrive = ClientDrive;
module.exports = { ClientDrive };