const AWS = require('aws-sdk');
const Promise = require('bluebird');
const rp = require('request-promise');
const { removeUnwantedWords } = require('../lib/util');

const rekognition = new AWS.Rekognition({
  accessKeyId: process.env.REKOGNITION_API_KEY,
  secretAccessKey: process.env.REKOGNITION_API_SECRET,
  region: 'eu-west-1'
});

const spoonacular = 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes';
// const spoonacular = 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/searchComplex'

/* Return an array of possible food names.
 * @returns {Array}
 * @params {ExpressRoute} req, res, next
 */
function getFoodNamesFromAWSRekognition(req, res, next) {
  const image = req.body.image.match(/.+base64,(.+)/)[1];
  const buffer = new Buffer(image, 'base64');

  return new Promise((resolve, reject) => {
    rekognition.detectLabels({
      Image: { Bytes: buffer },
      MaxLabels: 123
    }, (err, data) => {
      if(err) return reject(err);
      return resolve(data);
    });
  }).then(data => data.Labels.map(label => label.Name)) // Get names from the AWS response
    .then(data => removeUnwantedWords(data)) // Clean verbose and weird ter,s
    .then(data => res.json(data))
    .catch(next);
}

/* Returns a set of recipes based on the input of a comma-separated `ingredients` list.
 * @returns { Array }
 */


function getRecipesFromIngredients(req, res, next) {
  const { ingredients } =  req.body;
  rp({
    url: `${spoonacular}/findByIngredients`,
    // data from rekognition returned an array, spoonacular API query string needs a list separated by commas
    qs: {
      number: 20,
      ranking: 2,
      fillIngredients: true,
      ingredients
    },
    // spoonacular API key goes in the header of the request
    headers: {
      'Accept': 'application/json',
      'X-Mashape-Key': process.env.SPOONACULAR_API_KEY
    },
    json: true,
    method: 'GET'
  })
    .then(data => res.json(data))
    .catch(next);
}

// 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/searchComplex?addRecipeInformation=false&cuisine=american&diet=vegan&excludeIngredients=coconut%2C+mango&fillIngredients=false&includeIngredients=onions%2C+lettuce%2C+tomato&instructionsRequired=false&intolerances=peanut%2C+shellfish&limitLicense=false&maxCalories=1500&maxCarbs=100&maxFat=100&maxProtein=100&minCalories=150&minCarbs=5&minFat=5&minProtein=5&number=10&offset=0&query=burger&ranking=2&type=main+course'
//
// 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/findByIngredients?fillIngredients=false&ingredients=apples%2Cflour%2Csugar&limitLicense=false&number=5&ranking=1'

function getRecipesFromIngredientsAndDiet(req, res, next) {
  const includeIngredients = req.body.ingredients;
  const { diet } = req.query;
  rp({
    url: `${spoonacular}/searchComplex`,
    // data from rekognition returned an array, spoonacular API query string needs a list separated by commas
    qs: {
      number: 20,
      ranking: 2,
      fillIngredients: true,
      includeIngredients,
      diet
    },
    // spoonacular API key goes in the header of the request
    headers: {
      'Accept': 'application/json',
      'X-Mashape-Key': process.env.SPOONACULAR_API_KEY
    },
    json: true,
    method: 'GET'
  })
    .then(data => res.json(data.results))
    .catch(next);
}

function getLabels(req, res, next) {
  // convert image into base64 as required by AWS rekognition
  let listOfIngredients = null;
  if (!req.body.image) {
    listOfIngredients = Promise.resolve(req.body.ingredients);
  } else {
    const imageData = req.body.image.match(/.+base64,(.+)/)[1];
    const buffer = new Buffer(imageData, 'base64');

    // create promise to get the data from AWS rekognition
    listOfIngredients = new Promise((resolve, reject) => {
      rekognition.detectLabels({
        Image: { Bytes: buffer },
        MaxLabels: 123
      }, (err, data) => {
        if(err) return reject(err);
        return resolve(data);
      });
    }).then(data => data.Labels.map(label => label.Name).join(',').toLowerCase());
  }
  // from the data in the response from AWS, map over the labels and return the array of the label names
  listOfIngredients     // use request-promise to send the data from AWS rekognition to the spoonacular API to find recipes by ingredients
    .then(labels => rp({
      url: `${spoonacular}/findByIngredients`,
      // data from rekognition returned an array, spoonacular API query string needs a list separated by commas
      qs: {
        number: 20,
        ingredients: labels
      },
      // spoonacular API key goes in the header of the request
      headers: {
        'Accept': 'application/json',
        'X-Mashape-Key': process.env.SPOONACULAR_API_KEY
      },
      json: true,
      method: 'GET'
    }, () => console.log(labels)))
    // send the reponse to the frontend
    .then(response => res.json(response))
    .catch(next);
}

// using request-promise to get the id from the above response, and find the recipe using this id
function getRecipeById(req, res, next) {
  rp({
    url: `${spoonacular}/${req.params.id}/information`,
    qs: {
      // if I want nutrition data, change this to true
      includeNutrition: 'false'
    },
    headers: {
      'Accept': 'application/json',
      'X-Mashape-Key': process.env.SPOONACULAR_API_KEY
    },
    json: true,
    method: 'GET'
  })
    .then(response => res.json(response))
    .catch(next);
}

module.exports = {
  getLabels,
  getRecipeById,
  getFoodNamesFromAWSRekognition,
  getRecipesFromIngredients,
  getRecipesFromIngredientsAndDiet
};
