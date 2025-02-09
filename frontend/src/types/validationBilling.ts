import { z } from "zod";

export const billingSchema = z.object({
    name: z.string().min(3, "Nama harus memiliki minimal 3 karakter").max(45, "Nama tidak boleh lebih dari 45 karakter"),
    phone: z.string().min(11, "Nomor telepon harus memiliki minimal 11 karakter").max(15, "Nomor telepon tidak boleh lebih dari 15 karakter"),
    email: z.string().email("Format email tidak valid").min(8, "Email harus memiliki minimal 8 karakter").max(45, "Email tidak boleh lebih dari 45 karakter"),
    city: z.string().min(3, "Nama kota harus memiliki minimal 3 karakter").max(45, "Nama kota tidak boleh lebih dari 45 karakter"),
    address: z.string().min(10, "Alamat harus memiliki minimal 10 karakter"),
    post_code: z.string().regex(/^\d{5}$/, "Kode pos harus terdiri dari tepat 5 digit angka"),
});

export const paymentSchema = z.object({
    payment_proof: z
        .instanceof(File)
        .refine(
            (file) => ["image/png", "image/jpeg", "image/jpg"].includes(file.type),
            "File harus berformat PNG, JPG, atau JPEG"
        )
        .refine(
            (file) => file.size <= 2048 * 1024,
            "Ukuran file tidak boleh lebih dari 2MB"
        ),
});


export const viewBillingSchema = z.object({
    email: z.string()
        .email("Format email tidak valid")
        .min(3, "Email harus memiliki minimal 3 karakter")
        .max(45, "Email tidak boleh lebih dari 45 karakter"),

    item_trx_id: z.string()
        .min(5, "ID transaksi harus memiliki minimal 5 karakter")
        .max(12, "ID transaksi tidak boleh lebih dari 12 karakter"),
});