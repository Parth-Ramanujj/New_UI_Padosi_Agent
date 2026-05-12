import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Star, Plus, X, HelpCircle } from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';

export type ExpertiseLevel = 1 | 2 | 3 | 4 | 5;

interface Product {
  id: string;
  name: string;
  isCustom?: boolean;
}

interface ExpertiseGridProps {
  title: string;
  icon?: React.ReactNode;
  products: Product[];
  values: Record<string, ExpertiseLevel>;
  onChange: (productId: string, level: ExpertiseLevel) => void;
  onAddCustomProduct?: (name: string) => void;
  onRemoveCustomProduct?: (productId: string) => void;
  customProducts?: Product[];
}

const StarRating: React.FC<{
  value: ExpertiseLevel | undefined;
  onChange: (level: ExpertiseLevel) => void;
}> = ({ value, onChange }) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = (hoverValue ?? value ?? 0) >= star;
        return (
          <button
            key={star}
            type="button"
            className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange(star as ExpertiseLevel);
            }}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(null)}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                isActive
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-muted-foreground/40'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

const ExpertiseGrid: React.FC<ExpertiseGridProps> = ({
  title,
  icon,
  products,
  values,
  onChange,
  onAddCustomProduct,
  onRemoveCustomProduct,
  customProducts = [],
}) => {
  const [newProductName, setNewProductName] = useState('');
  const [showAddField, setShowAddField] = useState(false);

  const allProducts = [...products, ...customProducts];

  const handleAddProduct = () => {
    if (newProductName.trim() && onAddCustomProduct) {
      onAddCustomProduct(newProductName.trim());
      setNewProductName('');
      setShowAddField(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
          <InfoTooltip content="Rate your expertise from 1 (basic knowledge) to 5 (expert level). Higher ratings help customers find specialists for specific products">
            <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
          </InfoTooltip>
        </div>
        <p className="text-sm text-muted-foreground">
          हर प्रोडक्ट में अपनी एक्सपर्टीज़ रेट करें (1⭐ = बेसिक, 5⭐ = एक्सपर्ट)
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm font-medium text-muted-foreground">Product</span>
            <span className="text-sm font-medium text-muted-foreground">Expertise Level</span>
          </div>

          {/* Product rows */}
          {allProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{product.name}</span>
                {product.isCustom && onRemoveCustomProduct && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveCustomProduct(product.id);
                    }}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <StarRating
                value={values[product.id]}
                onChange={(level) => onChange(product.id, level)}
              />
            </div>
          ))}

          {/* Add custom product */}
          {onAddCustomProduct && (
            <div className="pt-2">
              {showAddField ? (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter product name..."
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddProduct();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button type="button" size="sm" onClick={(e) => {
                    e.preventDefault();
                    handleAddProduct();
                  }} disabled={!newProductName.trim()}>
                    Add
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAddField(false);
                      setNewProductName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowAddField(true);
                  }}
                  className="text-muted-foreground"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Other Product
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">स्टार गाइड / Rating Guide:</p>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>⭐ बेसिक</span>
            <span>⭐⭐ थोड़ा अनुभव</span>
            <span>⭐⭐⭐ अच्छा</span>
            <span>⭐⭐⭐⭐ बहुत अच्छा</span>
            <span>⭐⭐⭐⭐⭐ एक्सपर्ट</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpertiseGrid;
