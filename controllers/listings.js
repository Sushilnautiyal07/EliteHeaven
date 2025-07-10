const Listing = require('../models/listing');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {
  const { category } = req.query; // URL se ?category=xyz le lo
  let allistings;

  if (category) {
    allistings = await Listing.find({ category }); // filter by category
  } else {
    allistings = await Listing.find({}); // show all
  }

  res.render('listings/index', { allistings, category }); // category bhi bhejna hai
};
module.exports.search = async (req, res) => {
  const { q } = req.query;
  const regex = new RegExp(q, 'i'); // case-insensitive match

  const allistings = await Listing.find({
    $or: [{ title: regex }, { location: regex }]
  });

  res.render("listings/index", { allistings, category: null }); 

};

module.exports.renderNewForm=(req,res)=>{
    res.render('listings/new');
}

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:'reviews', populate: { path: 'author' }}).populate('owner');
    if(!listing) {
        req.flash('error', 'Listing you are looking for does not exist');
        return res.redirect('/listings');
    }
    res.render('listings/show',{listing});
}

module.exports.createListing=async(req,res,next)=>{
    if(!req.body.listing) {
        throw new ExpressErrors(400, "Invalid Listing Data");
    }

    let coordinate=await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
     limit: 1
    })
    .send();

    const newListing=new Listing(req.body.listing);
    newListing.owner = req.user._id; // Set the owner to the currently logged-in user
    if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  } else {
    console.log("⚠️ No file uploaded");
  }
    newListing.geometry = coordinate.body.features[0].geometry;
    await newListing.save();
    req.flash('success', 'New listing created successfully!');
    res.redirect('/listings');
}

module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
     if(!listing) {
        req.flash('error', 'Listing you are looking for does not exist');
        return res.redirect('/listings');
    }
    let OriginalImageUrl=listing.image.url;
    OriginalImageUrl=OriginalImageUrl.replace("/upload","/upload/w_250");
    res.render('listings/edit',{listing,OriginalImageUrl});
}

module.exports.updateListing=async(req, res) => {
    if(!req.body.listing) {
        throw new ExpressErrors(400, "Invalid Listing Data");
    }
    const { id } = req.params;
    // req.body now contains nested structure like { title, description, ..., image: { url: '...' } }
    let listing=await Listing.findByIdAndUpdate(id, req.body.listing);
    if(typeof req.file !=="undefined"){
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        await listing.save();
    }
    req.flash('success', 'Listing updated successfully!');
    res.redirect('/listings');
           
}
module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted successfully!');
    res.redirect('/listings');
}

