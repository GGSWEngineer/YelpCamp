const mongoose = require("mongoose");
const cities = require("./cities");
const {places, descriptors} = require("./seedHelpers") 
const Campground = require("../models/campground")


mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// useCreateIndex is not supported

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
})

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)]
}



const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 300; i++) {
      const random1000 = Math.floor(Math.random() * 1000) 
      const price = Math.floor(Math.random() * 20) + 10
      const camp = new Campground({
          // YOUR USER ID
            author: "63b27c25a42bf407c5a1c3da",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit quasi quos ipsum totam! Magnam dolorem eveniet blanditiis nisi, voluptas quisquam ipsa. Aut sint voluptate, repudiandae labore sit recusandae? Expedita, voluptatibus.",
            price,
            geometry: { 
              type: 'Point', 
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude
             ] 
            },
            images:[
                {
                  url: 'https://res.cloudinary.com/dpr2txfer/image/upload/v1673106963/YelpCamp/z8vocjyapc1oe4jdxb2r.jpg',
                  filename: 'YelpCamp/z8vocjyapc1oe4jdxb2r'
                },
                {
                  url: 'https://res.cloudinary.com/dpr2txfer/image/upload/v1673106963/YelpCamp/nlzk3f2il2biyp62c881.jpg',
                  filename: 'YelpCamp/nlzk3f2il2biyp62c881'
                }
              ]
        })
    await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})