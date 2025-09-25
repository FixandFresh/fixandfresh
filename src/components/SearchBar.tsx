import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { serviceCategories } from '@/data/services';
import { useLanguage } from '@/contexts/LanguageContext';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onServiceSelect?: (service: any) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  onServiceSelect, 
  placeholder 
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length > 0) {
      const filtered = serviceCategories.flatMap(category => 
        category.services.filter(service => 
          service.name.toLowerCase().includes(value.toLowerCase()) ||
          service.description.toLowerCase().includes(value.toLowerCase())
        ).map(service => ({ ...service, category: category.name }))
      );
      setFilteredServices(filtered);
      setIsOpen(true);
    } else {
      setFilteredServices([]);
      setIsOpen(false);
    }
    
    onSearch(value);
  };

  const handleServiceClick = (service: any) => {
    setQuery(service.name);
    setIsOpen(false);
    onServiceSelect?.(service);
  };

  const clearSearch = () => {
    setQuery('');
    setFilteredServices([]);
    setIsOpen(false);
    onSearch('');
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder={placeholder || t('search.placeholder')}
          value={query}
          onChange={handleInputChange}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {isOpen && filteredServices.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredServices.map((service, index) => (
            <div
              key={index}
              onClick={() => handleServiceClick(service)}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
            >
              <div className="font-medium text-sm">{service.name}</div>
              <div className="text-xs text-gray-500">{service.category}</div>
              <div className="text-xs text-green-600 font-medium">${service.price}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { SearchBar };
export default SearchBar;