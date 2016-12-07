> Your SashiDo appname is: `SashiDo-Demo App`

# How SashiDo & GitHub work together

This is the private repo for your application. Let us explain in breif how the Cloud Code works on SashiDo:

##### Developing of the Cloud Code

`./cloud/main.js` is the root file which we import on SashiDo's cloud. **Don't change the name**, if you want to run it. There are few simple examples there, so take a look of them :)

##### Hosting your website

`public/` is the directory in which you can put your `html`, `css`, `js`, `images` files, in case you want to host your app website on SashiDo for example :)


##### Deploying to SashiDo

When you `git push` changes to the `master` branch of this repo, SashiDo automatically deploys the code to the servers that your app is working on. However, you don't need any additional tools to manage and deploy your Cloud Code on SashiDo :)

> Remember every push to the `master` branch triggers a deploy. If you want to push you changes without triggering of a deploy, you can push them to the `development` branch for example and when you are done with all the changes ... just merge with the `master` branch.

##### Add collaborators to GitHub

And of course if you want to add a collaborator to this repo, go to SashiDo's Dashboard and add it as an app collaborator and SashiDo will add it here automatically.

# Test Advanced Cloud Code locally on your computer

In order to test your Cloud Code locally, instead of pushing every time to the SashiDo's cloud when you want to test some code changes, you are able to run similar to the SashiDo's production Parse Server on your local computer and you'll see the changes and results immediately :)

### 1. Install NodeJS

The required version of `NodeJS` is `>=4.3`

- https://nodejs.org/en/download/
- Via the package managers https://nodejs.org/en/download/package-manager/

### 2. Install and run MongoDB

- https://docs.mongodb.com/manual/installation/

### 3. Install your `npm` dependencies

If you want to use some specific npm packages you should add them to the `package.json`. After that you just need to run:

```
npm install
```

### 4. Customize Local app with Environment variables

If you need to customize you local app settings you are able to do it with ENV Variables:

- `DATABASE_URI` Default: 'mongodb://localhost:27017/dev'
- `APP_ID` Default: 'myAppId'
- `MASTER_KEY` : Default: ''
- `SERVER_URL` : Default: http://localhost:1337/1'
- `PORT` : Default: 1337

If you want to change  `DATABASE_URI` for example, run the following:

```
export DATABASE_URI=mongodb://localhost:27017/my_dev_db
```

### 5. Run your ParseServer + Cloud Code

Of course after 4 steps of configuring and installing it's time to start developing :) So ... write some code and run it with the following command:

```
npm start
```

That's it :) Happy coding :)
