// import models
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// Products belongsTo Category
Product.belongsTo(Category, {
  foreignKey: 'category_id',
  onDelete: 'CASCADE',
});

// Categories have many Products
Category.hasMany(Product, {
  foreignKey: 'category_id',
  onDelete: 'CASCADE',
});

// Products belongToMany Tags (through ProductTag)
Product.belongsToMany(Tag, {
  through: ProductTag,
  foreignKey: 'product_id',
  otherKey: 'tag_id',
});

// Tags belongToMany Products (through ProductTag)
Tag.belongsToMany(Product, {
  through: ProductTag,
  foreignKey: 'tag_id',
  otherKey: 'product_id',
});

Product.hasMany(ProductTag, {
  foreignKey: 'product_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
ProductTag.belongsTo(Product, {
  foreignKey: 'product_id',
});
Tag.hasMany(ProductTag, {
  foreignKey: 'tag_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
ProductTag.belongsTo(Tag, {
  foreignKey: 'tag_id',
});

(async () => {
  await Product.sync();
  await Tag.sync();
  await ProductTag.sync();
});


module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};
