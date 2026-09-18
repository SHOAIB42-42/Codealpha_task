const { sequelize, Product } = require('./models');

const seedProducts = async () => {
  await sequelize.sync({ force: true }); // Reset DB

  const products = [
    {
      title: 'Premium Wireless Headphones',
      description: 'Experience crystal clear sound with our latest premium wireless headphones. Features active noise cancellation and 30-hour battery life.',
      price: 199.99,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'
    },
    {
      title: 'Minimalist Smartwatch',
      description: 'Stay connected and track your fitness with this sleek, minimalist smartwatch. Water-resistant and compatible with iOS and Android.',
      price: 149.99,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'
    },
    {
      title: 'Ergonomic Office Chair',
      description: 'Work in comfort all day. Features adjustable lumbar support, breathable mesh back, and padded armrests.',
      price: 249.99,
      imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80'
    },
    {
      title: 'Mechanical Keychron Keyboard',
      description: 'Boost your typing speed and feel the satisfying click of a premium mechanical keyboard with RGB backlighting.',
      price: 89.99,
      imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80'
    }
  ];

  await Product.bulkCreate(products);
  console.log('Database seeded with products!');
  process.exit();
};

seedProducts();
