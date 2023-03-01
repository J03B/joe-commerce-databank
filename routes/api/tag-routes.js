const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // finds all tags with their associated Product data
  try {
    const tagData = await Tag.findAll({
      include: [
        { model: Product,
          through: {
            attributes: [],
          }
        },
      ],
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // finds a single tag by its `id` with its associated Product data
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product,
        through: {
          attributes: [],
        }
      }],
    });

    if (!tagData) {
      res.status(404).json({ message: 'No Tag with that ID!' })
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // Creates a new tag
  try {
    const tagData = await Tag.create(req.body);
    // if there are products, we need to create pairings to bulk create in the ProductTag model
    if (req.body.productIds.length) {
      const productTagIdArr = req.body.productIds.map((product_id) => {
        return {
          tag_id: tagData.id,
          product_id,
        };
      });
      const productTagData = await ProductTag.bulkCreate(productTagIdArr);
      res.status(200).json([tagData,productTagData]);
    }

    // if no product tags, just respond with tags
    else {
      res.status(200).json([tagData]);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put('/:id', (req, res) => {
  // updates a tag's name by its `id` value
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
  .then((tag) => {
    return ProductTag.findAll({where: {tag_id: req.params.id}});
  })
  .then((productTags) => {
    const productTagIdArr = productTags.map(({product_id}) => product_id);
    const newProductTags = req.body.productIds
      .filter((product_id) => !productTagIdArr.includes(product_id))
      .map((product_id) => {
        return {
          tag_id: req.params.id,
          product_id,
        };
      });

    // remove ones not included
    removeProductTags = productTags
      .filter(({ product_id }) => !req.body.productIds.includes(product_id))
      .map(({ id }) => id);

    // remove old product connections, add new ones
    return Promise.all([
      ProductTag.destroy({ where: { id: removeProductTags } }),
      ProductTag.bulkCreate(newProductTags),
    ]);
  })
  .then((updatedProductTags) => {
    res.status(200).json([updatedProductTags]);
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
});

router.delete('/:id', async (req, res) => {
  // deletes on tag by its `id` value
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!tagData) {
      res.status(404).json({ message: 'No Tag found with that ID!' });
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
