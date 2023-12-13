const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [
        {
          model: Category
        },
        {
          model: Tag,
          attributes: ['tag_name'],
          through: ProductTag,
          as: 'productTag_tag'
        }
      ]
    });

    res.json(productData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findOne({
      where: {
        id: req.params.id
      },
      include: [
        {
          model: Category
        },
        {
          model: Tag,
          attributes: ['tag_name'],
          through: ProductTag,
          as: 'productTag_tag'
        }
      ]
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with this id' });
      return;
    }

    res.json(productData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve the product.' });
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);

    if (Array.isArray(req.body.tagIds) && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => ({
        product_id: product.id,
        tag_id,
      }));

      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create product.' });
  }
});

// update product
router.put('/:id', async (req, res) => {
  try {
    await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const productTags = await ProductTag.findAll({ where: { product_id: req.params.id } });

    const productTagIds = productTags.map(({ tag_id }) => tag_id);

    const newProductTags = (req.body.tagIds || [])
      .filter((tag_id) => !productTagIds.includes(tag_id))
      .map((tag_id) => ({
        product_id: req.params.id,
        tag_id,
      }));

    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !(req.body.tagIds || []).includes(tag_id))
      .map(({ id }) => id);

    await Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(newProductTags),
    ]);

    res.json({ message: 'Product updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update product.' });
  }
});

// delete product
router.delete('/:id', async (req, res) => {
  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!productData) {
      res.status(404).json({ message: 'No Product found with this id' });
      return;
    }

    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

module.exports = router;
