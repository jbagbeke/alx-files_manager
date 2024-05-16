const express = require('express');
const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

const app = express();

app.use(express.json());

const FilesController = {
  postUpload: app.post('/files', async (req, res) => {
    const token = 'x-token' in req.headers ? req.headers['x-token'] : false;
    console.log(req.body);
    if (token) {
      const userId = await redisClient.get(`auth_${token}`);

      if (userId) {
        const name = 'name' in req.body ? req.body.name : false;
        const type = 'type' in req.body ? req.body.type : false;
        const parentId = 'parentId' in req.body ? req.body.parentId : false;
        const isPublic = 'isPublic' in req.body ? req.body.isPublic : false;
        const data = 'data' in req.body ? req.body.data : false;

        if (!name) {
          res.status(400).json({ error: 'Missing name' }).end();
          return;
        }
        if (!type) {
          res.status(400).json({ error: 'Missing type' }).end();
          return;
        }
        if (!data && type !== 'folder') {
          res.status(400).json({ error: 'Missing data' }).end();
          return;
        }
        if (parentId) {
          const parentFile = await dbClient.findFile({ _id: ObjectId(parentId) });

          if (parentFile) {
            if (parentFile.type !== 'folder') {
              res.status(400).json({ error: 'Parent is not a folder' }).end();
              return;
            }
          } else {
            res.status(400).json({ error: 'Parent not found' }).end();
            return;
          }
        }
        if (type === 'folder') {
          const folder = {
            userId,
            name,
            type,
            parentId: parentId === false ? 0 : parentId,
            isPublic,
          };
          if (await dbClient.insertFile(folder)) {
            folder.id = folder._id;
            delete folder._id;
            res.status(201).json(folder).end();
            return;
          }
        } else {
          const filePath = 'FOLDER_PATH' in process.env ? process.env.FOLDER_PATH : '/tmp/files_manager';
          const fileName = uuidv4();
          const fileData = Buffer.from(data, 'base64').toString('utf8');
          const file = {
            userId,
            name,
            type,
            isPublic,
            parentId: parentId === false ? 0 : parentId,
          };

          if (type === 'file' || type === 'image') {
            file.localPath = `${filePath}/${fileName}`;
          }

          if (await dbClient.insertFile(file)) {
            try {
              fs.mkdirSync(filePath, { recursive: true });
              fs.writeFileSync(`${filePath}/${fileName}`, fileData);
              delete file.localPath;
              file.id = file._id;
              delete file._id;
              res.status(201).json(file).end();
              return;
            } catch (err) {
              console.log(err);
            }
          }
        }
      }
    }
    res.status(401).json({ error: 'Unauthorized' }).end();
  }),
};

module.exports = FilesController;
