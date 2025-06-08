const express = require('express');
const router = express.Router();
const supabase = require("../config/supabaseClient");

// Get orders by manufacturer ID
router.get('/manufacturer/:id', async (req, res) => {
  const manufacturerId = req.params.id;

  const { data, error } = await supabase
    .from('product_order')
    .select('*')
    .contains('items', [{ manufacturer_id: manufacturerId }]);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json(data);
});

module.exports = router;
