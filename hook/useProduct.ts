import { useQuery } from '@tanstack/react-query';
import { getProducts, getProductById } from '../services/productService';
import { Product, ProductDetail } from '../models/models';

export const useProducts = () => {
    return useQuery<Product[], Error>({
        queryKey: ['products'],
        queryFn: getProducts,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: true,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        throwOnError: (error: Error, query) => {
            console.error('Failed to fetch products:', error);
            return false;
        },
        select: (data) => {
            return data.sort((a, b) => a.name.localeCompare(b.name));
        }

    });
}

export const useProductById = (productId: string) => {
    return useQuery<ProductDetail, Error>({
        queryKey: ['product_detail', productId],
        queryFn: () => getProductById(productId),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: true,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        throwOnError: (error: Error, query) => {
            console.error('Failed to fetch product:', error);
            return false;
        }
    });

}

