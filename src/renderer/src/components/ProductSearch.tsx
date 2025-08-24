// File: src/renderer/src/components/ProductSearch.tsx

import React, { useState, useEffect } from 'react'
import { Input } from './ui/input'
import { Product } from '../types'

interface ProductSearchProps {
  onProductSelect: (product: Product) => void
}

function ProductSearch({ onProductSelect }: ProductSearchProps): JSX.Element {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Fetch all products once when the component mounts
    window.db.getProducts().then(setAllProducts)
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase()
      const results = allProducts
        .filter((p) => p.name.toLowerCase().includes(lowercasedTerm))
        .slice(0, 5) // Limit to top 5 results for performance
      setFilteredProducts(results)
      setIsOpen(results.length > 0)
    } else {
      setFilteredProducts([])
      setIsOpen(false)
    }
  }, [searchTerm, allProducts])

  const handleSelect = (product: Product) => {
    onProductSelect(product)
    setSearchTerm('') // Reset search after selection
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search for a product by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)} // Delay to allow click
        onFocus={() => searchTerm && setIsOpen(true)}
      />
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg">
          <ul>
            {filteredProducts.map((product) => (
              <li
                key={product.id}
                className="px-3 py-2 cursor-pointer hover:bg-muted"
                onMouseDown={() => handleSelect(product)} // Use onMouseDown to fire before onBlur
              >
                {product.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ProductSearch