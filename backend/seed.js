const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sn0367086_db_user:CWvOWUKET2tdNpG6@cluster0.ayy94tg.mongodb.net/rentease?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI).then(() => console.log('✅ MongoDB Connected')).catch(err => { console.error(err); process.exit(1); });

const furniture = [
  { name: "Modern Velvet Sofa", price_per_month: 1200, deposit: 2400, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600" },
  { name: "Wooden Dining Table Set", price_per_month: 1500, deposit: 3000, image: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=600" },
  { name: "Queen Size Bed Frame", price_per_month: 1000, deposit: 2000, image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600" },
  { name: "Office Ergonomic Chair", price_per_month: 600, deposit: 1200, image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600" },
  { name: "Minimalist Study Desk", price_per_month: 700, deposit: 1400, image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600" },
  { name: "Bookshelf Storage Unit", price_per_month: 500, deposit: 1000, image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600" },
  { name: "L-Shaped Corner Sofa", price_per_month: 1800, deposit: 3600, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600" },
  { name: "Glass Coffee Table", price_per_month: 400, deposit: 800, image: "https://images.unsplash.com/photo-1598300056393-4aac492f4344?w=600" },
  { name: "Wardrobe Closet", price_per_month: 900, deposit: 1800, image: "https://images.unsplash.com/photo-1616628182509-5e0f0d07c1a1?w=600" },
  { name: "TV Stand Cabinet", price_per_month: 650, deposit: 1300, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600" },
  { name: "Recliner Sofa Chair", price_per_month: 950, deposit: 1900, image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600" },
  { name: "King Size Bed with Storage", price_per_month: 1400, deposit: 2800, image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600" },
  { name: "Sofa Cum Bed", price_per_month: 1100, deposit: 2200, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600" },
  { name: "Chest of Drawers", price_per_month: 550, deposit: 1100, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600" },
  { name: "Dining Chair Set of 4", price_per_month: 700, deposit: 1400, image: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=600" },
  { name: "Bar Stool Set", price_per_month: 450, deposit: 900, image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=600" },
  { name: "Ottoman Footstool", price_per_month: 300, deposit: 600, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600" },
  { name: "Shoe Rack Cabinet", price_per_month: 250, deposit: 500, image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600" },
  { name: "Wall Mounted Shelves Set", price_per_month: 350, deposit: 700, image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=600" },
  { name: "Center Table", price_per_month: 500, deposit: 1000, image: "https://images.unsplash.com/photo-1565791380713-1756b9a05343?w=600" },
  { name: "Bunk Bed Kids", price_per_month: 1200, deposit: 2400, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600" },
  { name: "Folding Dining Table", price_per_month: 600, deposit: 1200, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600" },
  { name: "Accent Armchair", price_per_month: 800, deposit: 1600, image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600" },
  { name: "Bedside Tables Pair", price_per_month: 400, deposit: 800, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600" },
  { name: "Lounge Chair", price_per_month: 750, deposit: 1500, image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600" },
].map(p => ({ ...p, category: "Furniture", available_units: 10 }));

const appliances = [
  { name: "Double Door Refrigerator", price_per_month: 2000, deposit: 4000, image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600" },
  { name: "Front Load Washing Machine", price_per_month: 1400, deposit: 2800, image: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0f?w=600" },
  { name: "Microwave Oven", price_per_month: 500, deposit: 1000, image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600" },
  { name: "Air Conditioner 1.5 Ton", price_per_month: 2200, deposit: 4400, image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600" },
  { name: "Smart LED TV 55 Inch", price_per_month: 1800, deposit: 3600, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600" },
  { name: "Water Purifier RO", price_per_month: 600, deposit: 1200, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600" },
  { name: "Induction Cooktop", price_per_month: 300, deposit: 600, image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600" },
  { name: "Vacuum Cleaner", price_per_month: 450, deposit: 900, image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600" },
  { name: "Ceiling Fan", price_per_month: 250, deposit: 500, image: "https://images.unsplash.com/photo-1592853625601-bb9d23da12f4?w=600" },
  { name: "Room Heater", price_per_month: 350, deposit: 700, image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600" },
  { name: "Dishwasher", price_per_month: 1600, deposit: 3200, image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600" },
  { name: "Air Purifier HEPA", price_per_month: 800, deposit: 1600, image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600" },
  { name: "Top Load Washing Machine", price_per_month: 1100, deposit: 2200, image: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0f?w=600" },
  { name: "Mini Refrigerator", price_per_month: 900, deposit: 1800, image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600" },
  { name: "Split AC 2 Ton", price_per_month: 2800, deposit: 5600, image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600" },
  { name: "OTG Oven", price_per_month: 400, deposit: 800, image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600" },
  { name: "Electric Kettle", price_per_month: 150, deposit: 300, image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600" },
  { name: "Coffee Maker", price_per_month: 350, deposit: 700, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600" },
  { name: "Mixer Grinder", price_per_month: 200, deposit: 400, image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600" },
  { name: "Electric Iron", price_per_month: 120, deposit: 240, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600" },
  { name: "Table Fan", price_per_month: 180, deposit: 360, image: "https://images.unsplash.com/photo-1592853625601-bb9d23da12f4?w=600" },
  { name: "Exhaust Fan Kitchen", price_per_month: 200, deposit: 400, image: "https://images.unsplash.com/photo-1592853625601-bb9d23da12f4?w=600" },
  { name: "Water Heater Geyser", price_per_month: 400, deposit: 800, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600" },
  { name: "Smart TV 43 Inch", price_per_month: 1200, deposit: 2400, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600" },
  { name: "Dryer Machine", price_per_month: 1300, deposit: 2600, image: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0f?w=600" },
].map(p => ({ ...p, category: "Appliances", available_units: 10 }));

const electronics = [
  { name: "MacBook Pro 14-inch M3", price_per_month: 3500, deposit: 7000, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600" },
  { name: "Gaming Laptop RTX 4060", price_per_month: 4000, deposit: 8000, image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600" },
  { name: "4K Monitor 27-inch", price_per_month: 1200, deposit: 2400, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600" },
  { name: "iPad Pro 12.9-inch", price_per_month: 2500, deposit: 5000, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600" },
  { name: "Sony WH-1000XM5 Headphones", price_per_month: 800, deposit: 1600, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600" },
  { name: "Portable Bluetooth Speaker", price_per_month: 400, deposit: 800, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600" },
  { name: "DSLR Camera Nikon Kit", price_per_month: 2800, deposit: 5600, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600" },
  { name: "Mechanical Keyboard Corsair", price_per_month: 600, deposit: 1200, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600" },
  { name: "Dell XPS 15 Laptop", price_per_month: 3200, deposit: 6400, image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600" },
  { name: "Samsung Galaxy Tab S9", price_per_month: 2000, deposit: 4000, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600" },
  { name: "Gaming Desktop PC", price_per_month: 4500, deposit: 9000, image: "https://images.unsplash.com/photo-1593640408182-31c228a63a9b?w=600" },
  { name: "Ultrawide Monitor 34-inch", price_per_month: 1800, deposit: 3600, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600" },
  { name: "Ring Light 18-inch", price_per_month: 350, deposit: 700, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600" },
  { name: "Webcam 4K Logitech", price_per_month: 500, deposit: 1000, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600" },
  { name: "Projector Full HD", price_per_month: 1500, deposit: 3000, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600" },
  { name: "GoPro Hero 12", price_per_month: 1200, deposit: 2400, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600" },
  { name: "Wireless Earbuds AirPods Pro", price_per_month: 600, deposit: 1200, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600" },
  { name: "Smart Watch Apple Series 9", price_per_month: 900, deposit: 1800, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600" },
  { name: "Printer HP LaserJet", price_per_month: 700, deposit: 1400, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600" },
  { name: "External SSD 1TB", price_per_month: 300, deposit: 600, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600" },
  { name: "PS5 Gaming Console", price_per_month: 3000, deposit: 6000, image: "https://images.unsplash.com/photo-1593640408182-31c228a63a9b?w=600" },
  { name: "Xbox Series X", price_per_month: 2800, deposit: 5600, image: "https://images.unsplash.com/photo-1593640408182-31c228a63a9b?w=600" },
  { name: "Nintendo Switch OLED", price_per_month: 1800, deposit: 3600, image: "https://images.unsplash.com/photo-1593640408182-31c228a63a9b?w=600" },
  { name: "Soundbar Bose 700", price_per_month: 1100, deposit: 2200, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600" },
  { name: "Chromebook Lenovo", price_per_month: 1500, deposit: 3000, image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600" },
].map(p => ({ ...p, category: "Electronics", available_units: 10 }));

const fitness = [
  { name: "Treadmill Pro 2000", price_per_month: 2500, deposit: 5000, image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600" },
  { name: "Adjustable Dumbbells 5-50kg", price_per_month: 700, deposit: 1400, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600" },
  { name: "Yoga Mat Premium 6mm", price_per_month: 200, deposit: 400, image: "https://images.unsplash.com/photo-1601925228149-ba8f7a72e4a0?w=600" },
  { name: "Stationary Exercise Bike", price_per_month: 1800, deposit: 3600, image: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600" },
  { name: "Pull-Up Bar & Resistance Bands", price_per_month: 350, deposit: 700, image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600" },
  { name: "Rowing Machine Concept2", price_per_month: 2200, deposit: 4400, image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600" },
  { name: "Barbell & Weight Plates Set", price_per_month: 900, deposit: 1800, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600" },
  { name: "Multi Station Gym Machine", price_per_month: 3500, deposit: 7000, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600" },
  { name: "Elliptical Cross Trainer", price_per_month: 2000, deposit: 4000, image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600" },
  { name: "Foam Roller Set", price_per_month: 150, deposit: 300, image: "https://images.unsplash.com/photo-1601925228149-ba8f7a72e4a0?w=600" },
  { name: "Kettlebell Set 8-32kg", price_per_month: 600, deposit: 1200, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600" },
  { name: "Ab Roller Wheel", price_per_month: 120, deposit: 240, image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600" },
  { name: "Jump Rope Speed Cable", price_per_month: 100, deposit: 200, image: "https://images.unsplash.com/photo-1601925228149-ba8f7a72e4a0?w=600" },
  { name: "Stepper Machine", price_per_month: 1200, deposit: 2400, image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600" },
  { name: "Boxing Punch Bag Set", price_per_month: 800, deposit: 1600, image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600" },
  { name: "Incline Decline Bench", price_per_month: 700, deposit: 1400, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600" },
  { name: "Power Rack Squat Stand", price_per_month: 1500, deposit: 3000, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600" },
  { name: "Spin Bike Peloton Style", price_per_month: 2500, deposit: 5000, image: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600" },
  { name: "Balance Board", price_per_month: 250, deposit: 500, image: "https://images.unsplash.com/photo-1601925228149-ba8f7a72e4a0?w=600" },
  { name: "TRX Suspension Trainer", price_per_month: 400, deposit: 800, image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600" },
  { name: "Massage Gun Theragun", price_per_month: 500, deposit: 1000, image: "https://images.unsplash.com/photo-1601925228149-ba8f7a72e4a0?w=600" },
  { name: "Gymnastics Mat 4x8ft", price_per_month: 600, deposit: 1200, image: "https://images.unsplash.com/photo-1601925228149-ba8f7a72e4a0?w=600" },
  { name: "Battle Ropes 10m", price_per_month: 450, deposit: 900, image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600" },
  { name: "Pull-Up Dip Station", price_per_month: 900, deposit: 1800, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600" },
  { name: "Vertical Climber Machine", price_per_month: 1800, deposit: 3600, image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600" },
].map(p => ({ ...p, category: "Fitness", available_units: 10 }));

const packages = [
  { name: "WFH Starter Bundle", price_per_month: 3500, deposit: 7000, image: "https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?w=600" },
  { name: "Studio Apartment Complete Setup", price_per_month: 5500, deposit: 11000, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600" },
  { name: "Home Gym Starter Pack", price_per_month: 4200, deposit: 8400, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600" },
  { name: "Student Dorm Bundle", price_per_month: 2800, deposit: 5600, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600" },
  { name: "Premium Living Room Set", price_per_month: 6500, deposit: 13000, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600" },
  { name: "Gaming Setup Bundle", price_per_month: 5000, deposit: 10000, image: "https://images.unsplash.com/photo-1593640408182-31c228a63a9b?w=600" },
  { name: "Home Office Pro Bundle", price_per_month: 4800, deposit: 9600, image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600" },
  { name: "Bachelor Pad Essentials", price_per_month: 3200, deposit: 6400, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600" },
  { name: "Bedroom Complete Package", price_per_month: 3800, deposit: 7600, image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600" },
  { name: "Kitchen Appliances Bundle", price_per_month: 4000, deposit: 8000, image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600" },
  { name: "Photography Studio Kit", price_per_month: 5500, deposit: 11000, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600" },
  { name: "2BHK Apartment Bundle", price_per_month: 9500, deposit: 19000, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600" },
  { name: "Fitness Transformation Pack", price_per_month: 5800, deposit: 11600, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600" },
  { name: "Smart Home Starter Kit", price_per_month: 4500, deposit: 9000, image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600" },
  { name: "Entertainment Bundle", price_per_month: 3500, deposit: 7000, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600" },
].map(p => ({ ...p, category: "Packages", available_units: 10 }));

const allProducts = [...furniture, ...appliances, ...electronics, ...fitness, ...packages];

const importData = async () => {
  try {
    await Product.deleteMany();
    await Product.insertMany(allProducts);
    console.log(`\n✅ SUCCESS — ${allProducts.length} products seeded!\n`);
    console.log(`   Furniture:   ${furniture.length}`);
    console.log(`   Appliances:  ${appliances.length}`);
    console.log(`   Electronics: ${electronics.length}`);
    console.log(`   Fitness:     ${fitness.length}`);
    console.log(`   Packages:    ${packages.length}`);
    process.exit();
  } catch (err) {
    console.error('❌ Seed Error:', err);
    process.exit(1);
  }
};

importData();