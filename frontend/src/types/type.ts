interface Specification {
    id: number,
    name: string,
}

interface Photo {
    id: number,
    photo: string,
}

interface Testimonial {
    id: number,
    name: string,
    message: string,
    rating: string,
    photo: string,
}

export interface Item {
    id: number,
    price: number,
    duration: number,
    name: string,
    slug: string,
    is_popular: boolean,
    is_displayed: boolean,
    category: Category,
    brand: Brand,
    stock: number,
    thumbnail: string,
    avg_rating: string,
    item_specifications: Specification[],
    item_photos: Photo[],
    item_testimonials: Testimonial[],
    description: string,
    created_at: Date,
    updated_at: Date,
}

export interface Category {
    id: number,
    name: string,
    slug: string,
    photo: string,
    items_count: string,
    items: Item[],
    popular_items: Item[],
}

export interface Brand {
    id: number,
    name: string,
    slug: string,
    photo: string,
    items_count: string,
    items: Item[],
    popular_items: Item[],
}

export interface BillingDetails {
    id: number,
    name: string,
    phone: string,
    email: string,
    payment_proof: string | null,
    address: string,
    post_code: number,
    city: string,
    item_trx_id: string,
    quantity: number,
    is_paid: boolean,
    on_store: boolean,
    sub_total_amount: number,
    total_tax_amount: number,
    total_amount: number,
    transaction_details: TransactionDetails[],
}

interface TransactionDetails {
    id: number,
    price: number,
    item_id: number,
    quantity: number,
    item: Item,
}

export interface CartItem {
    item_id: number,
    slug: string,
    quantity: number,
}

export type BillingFormData = {
    name: string,
    email: string,
    phone: string,
    post_code: number,
    address: string,
    city: string,
}