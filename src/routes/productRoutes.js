import { Router } from 'express';
import { Product } from '../models/Product.js';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const items = await Product.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(item);
  } catch (err) {
    console.error('Error al obtener detalle:', err);
    res.status(500).json({ message: 'Error al obtener detalle del producto' });
  }
});


router.post('/', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  try {
    const { name, description, price, imageUrl } = req.body;
    if (!name || typeof price !== 'number') {
      return res.status(400).json({ message: 'Nombre y precio son obligatorios' });
    }
    const created = await Product.create({ name, description, price, imageUrl });
    res.status(201).json(created);
  } catch (err) {
    console.error('Error al crear producto:', err);
    res.status(400).json({ message: 'Datos inválidos o error al crear' });
  }
});


router.put('/:id', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(updated);
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(400).json({ message: 'Error al actualizar el producto' });
  }
});


router.delete('/:id', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
});

export default router;
