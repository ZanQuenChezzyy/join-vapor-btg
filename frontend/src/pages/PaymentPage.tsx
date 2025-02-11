import { Link, useNavigate } from "react-router-dom";
import { BillingFormData, CartItem, Discount, Item } from "../types/type";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import apiClient from "../services/apiService";
import { paymentSchema } from "../types/validationBilling";

type FormData = {
    payment_proof: File | null;
    item_ids: { id: number; quantity: number }[];
};

export default function PaymentPage() {
    const [formData, setFormData] = useState<FormData>({
        payment_proof: null,
        item_ids: [],
    });

    const [cart, setCart] = useState<CartItem[]>([]);

    const [itemDetails, setItemDetails] = useState<Item[]>([]);

    const [billingData, setBillingData] = useState<BillingFormData | null>(null);

    const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

    const [loading, setLoading] = useState(true);

    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);

    const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
    const [discountAmount, setDiscountAmount] = useState<number>(0);

    const TAX_RATE = 0.003;
    const navigate = useNavigate();

    const fetchItemDetails = async (cartItems: CartItem[]) => {
        try {
            const fetchedDetails = await Promise.all(
                cartItems.map(async (item) => {
                    const response = await apiClient.get(`/item/${item.slug}`);
                    return response.data.data;
                })
            )
            setItemDetails(fetchedDetails);
            setLoading(false);

            const itemIdsWithQuantities = cartItems.map((cartItem) => ({
                id: cartItem.item_id,
                quantity: cartItem.quantity,
            }));

            setFormData((prevData) => ({
                ...prevData,
                item_ids: itemIdsWithQuantities,
            }));
        } catch (error) {
            console.error("Error mendapatkan detail item", error);
            setError("Gagal mendapatkan detail item.");
            setLoading(false);
        }
    };

    useEffect(() => {
        const cartData = localStorage.getItem("cart");
        const savedBillingData = localStorage.getItem("billingData");
        const savedDiscount = localStorage.getItem("appliedDiscount");

        if (savedBillingData) {
            setBillingData(JSON.parse(savedBillingData) as BillingFormData);
        }

        if (!cartData || (cartData && JSON.parse(cartData).length === 0)) {
            navigate('/');
            return;
        }

        const cartItems = JSON.parse(cartData) as CartItem[];
        setCart(cartItems);
        fetchItemDetails(cartItems);

        // Ambil discountAmount langsung dari localStorage jika tersedia
        if (savedDiscount) {
            const parsedDiscount = JSON.parse(savedDiscount);
            setAppliedDiscount(parsedDiscount);

            // Pastikan discountAmount ada dan valid
            if (parsedDiscount.discountAmount !== undefined) {
                setDiscountAmount(parsedDiscount.discountAmount);
            }
        }
    }, [navigate]);

    const subtotal = itemDetails.reduce((acc, item) => {
        const cartProduk = cart.find((produk) => produk.item_id === item.id);
        return acc + (cartProduk ? item.price * cartProduk.quantity : 0);
    }, 0);

    const totalQuantity = cart.reduce((acc, produk) => acc + produk.quantity, 0);

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax - discountAmount;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setFormData((prev) => ({
            ...prev,
            payment_proof: file,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = paymentSchema.safeParse(formData);
        if (!validation.success) {
            setFormErrors(validation.error.issues);
            return;
        }

        setFormErrors([]);

        const submissionData = new FormData();

        if (formData.payment_proof) {
            submissionData.append("payment_proof", formData.payment_proof);
        }

        if (billingData) {
            submissionData.append("name", billingData.name);
            submissionData.append("email", billingData.email);
            submissionData.append("phone", billingData.phone);
            submissionData.append("city", billingData.city);
            submissionData.append("address", billingData.address);
            submissionData.append("post_code", billingData.post_code);
        }

        formData.item_ids.forEach((item, index) => {
            submissionData.append(`item_ids[${index}][id]`, String(item.id));
            submissionData.append(`item_ids[${index}][quantity]`, String(item.quantity));
        });

        const storedDiscount = localStorage.getItem("appliedDiscount");
        if (storedDiscount) {
            const discountData = JSON.parse(storedDiscount);
            submissionData.append("discount_id", discountData.discount?.id || "");
            submissionData.append("discount_amount", discountData.discountAmount || 0);
        }

        try {
            setLoading(true);
            const response = await apiClient.post("billing-detail", submissionData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            if (response.status === 200 || response.status === 201) {
                console.log("Transaction response data: ", response.data.data);
                const itemTrxId = response.data.data.item_trx_id;

                if (!itemTrxId) {
                    console.error("Gagal: ID Transaksi tidak diketahui");
                }
                setSuccessMessage("Bukti Pembayaran berhasil dikirim!");
                localStorage.removeItem("cart");
                localStorage.removeItem("billingData");
                localStorage.removeItem("appliedDiscount");
                setFormData({ payment_proof: null, item_ids: [] });
                setLoading(false);
                navigate(`/transaction-finished?trx_id=${itemTrxId}`);
            } else {
                console.error("Status Respon yang tidak terduga:", response.status);
                setLoading(false);
            }
        } catch (error) {
            console.error("Upload Bukti Pembayaran Gagal", error);
            setLoading(false);
            setFormErrors([]);
        }
    }

    if (loading) {
        return <p className="text-center flex justify-center items-center min-h-screen">Memuat...</p>;
    }

    if (error) {
        return <p className="text-center flex justify-center items-center min-h-screen">Gagal Memuat Kategori: {error}</p>
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <main className="mx-auto flex min-h-screen max-w-[640px] flex-col gap-5 bg-[#F6F6F8] pb-[30px]">
            <section id="NavTop">
                <div className="px-5">
                    <div className="mt-5 flex w-full flex-col gap-5 rounded-3xl bg-white pb-[44px] pt-3">
                        <div className="relative">
                            <Link to={'/transaction'}>
                                <div className="absolute left-3 top-1/2 flex size-[44px] shrink-0 -translate-y-1/2 items-center justify-center rounded-full border border-items-greylight">
                                    <img
                                        src="/assets/images/icons/left.svg"
                                        alt="icon"
                                        className="size-5 shrink-0"
                                    />
                                </div>
                            </Link>
                            <div className="flex flex-col gap-[2px]">
                                <h1 className="text-center text-lg font-bold leading-[27px]">
                                    Pembayaran
                                </h1>
                                <p className="text-center text-sm leading-[21px] text-items-grey">
                                    Formulir Pembayaran
                                </p>
                            </div>
                        </div>
                        <div id="ProgressBar" className="relative px-5">
                            <div className="flex">
                                <div className="flex flex-col items-center">
                                    <div className="relative z-10 flex h-[25px] items-center">
                                        <div className="h-2 w-[60px] rounded-full bg-items-purple" />
                                        <div className="absolute right-0 top-0 translate-x-1/2">
                                            <div className="flex flex-col items-center gap-[6px]">
                                                <div className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-items-purple text-xs font-bold leading-[18px] text-white">
                                                    1
                                                </div>
                                                <p className="text-xs font-semibold leading-[18px]">
                                                    Informasi
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative flex h-[25px] w-full items-center">
                                    <div className="left-0 h-2 w-1/2 rounded-full bg-items-purple" />
                                    <div className="absolute right-1/2 top-0 translate-x-1/2">
                                        <div className="flex flex-col items-center gap-[6px]">
                                            <div className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-items-purple text-xs font-bold leading-[18px] text-white">
                                                2
                                            </div>
                                            <p className="text-xs font-semibold leading-[18px]">
                                                Pembayaran
                                            </p>
                                        </div>
                                    </div>
                                    <div className="right-0 h-2 w-1/2 rounded-full bg-[#EDEDF5]" />
                                </div>
                                <div className="relative z-10 flex h-[25px] w-[60px] items-center">
                                    <div className="h-2 w-[60px] rounded-full bg-[#EDEDF5]" />
                                    <div className="absolute left-0 top-0 -translate-x-1/2">
                                        <div className="flex flex-col items-center gap-[6px]">
                                            <div className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#D8D8E4] text-xs font-bold leading-[18px]">
                                                3
                                            </div>
                                            <p className="text-xs font-semibold leading-[18px]">
                                                Pengiriman
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <header>
                <div className="flex flex-col gap-1 px-5">
                    <h2 className="text-[26px] font-bold leading-[39px]">Buat Pembayaran</h2>
                    <p className="text-items-grey">Data asli harus diberikan!</p>
                </div>
            </header>
            <section id="Informations" className="px-5">
                <div className="flex flex-col gap-5 rounded-3xl bg-white px-5 py-[30px]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-[10px]">
                            <img
                                src="/assets/images/icons/information.svg"
                                alt="icon"
                                className="size-[38px] shrink-0"
                            />
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold text-[#0C0422]">Detail Pembayaran</h3>
                                <p className="text-sm leading-[21px] text-[#8C8582]">
                                    Sebelum bayar Silahkan cek!
                                </p>
                                {appliedDiscount && (
                                    <span className="text-sm text-[#0C0422] font-semibold">
                                        Kode Diskon : {appliedDiscount.code}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            data-expand="PaymentDetailsJ"
                            className="shrink-0"
                        >
                            <img
                                src="/assets/images/icons/bottom.svg"
                                alt="icon"
                                className="size-6 shrink-0 transition-all duration-300"
                            />
                        </button>
                    </div>
                    <div id="PaymentDetailsJ" className="flex flex-col gap-5">
                        <div className="box h-[1px] w-full" />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-[6px]">
                                <img
                                    src="/assets/images/icons/list.svg"
                                    alt="icon"
                                    className="size-5 shrink-0"
                                />
                                <p>Total Kuantitas</p>
                            </div>
                            <strong className="font-semibold">{totalQuantity} Unit</strong>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-[6px]">
                                <img
                                    src="/assets/images/icons/list.svg"
                                    alt="icon"
                                    className="size-5 shrink-0"
                                />
                                <p>Sub Total</p>
                            </div>
                            <strong className="font-semibold">{formatCurrency(subtotal)}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-[6px]">
                                <img
                                    src="/assets/images/icons/list.svg"
                                    alt="icon"
                                    className="size-5 shrink-0"
                                />
                                <p>Diskon</p>
                            </div>
                            <strong className="font-semibold">{formatCurrency(discountAmount)}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-[6px]">
                                <img
                                    src="/assets/images/icons/list.svg"
                                    alt="icon"
                                    className="size-5 shrink-0"
                                />
                                <p>Biaya Pengiriman</p>
                            </div>
                            <strong className="font-semibold">Rp 0 (Promo)</strong>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-[6px]">
                                <img
                                    src="/assets/images/icons/list.svg"
                                    alt="icon"
                                    className="size-5 shrink-0"
                                />
                                <p>Pajak 0.3%</p>
                            </div>
                            <strong className="font-semibold">{formatCurrency(tax)}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-[6px]">
                                <img
                                    src="/assets/images/icons/list.svg"
                                    alt="icon"
                                    className="size-5 shrink-0"
                                />
                                <p>Total</p>
                            </div>
                            <strong className="text-[22px] font-bold leading-[33px] text-items-pink">
                                {formatCurrency(total)}
                            </strong>
                        </div>
                    </div>
                </div>
            </section>
            <section id="TrustedEwallets" className="px-5">
                <div className="flex flex-col gap-5 rounded-3xl bg-white px-[14px] py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-[10px]">
                            <img
                                src="/assets/images/icons/wallet.svg"
                                alt="icon"
                                className="size-[38px] shrink-0"
                            />
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold text-[#0C0422]">Trusted E-Wallets</h3>
                                <p className="text-sm leading-[21px] text-[#8C8582]">
                                    Choose lorem dolor active
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            data-expand="TrustedEwalletsJ"
                            className="shrink-0"
                        >
                            <img
                                src="/assets/images/icons/bottom.svg"
                                alt="icon"
                                className="size-6 shrink-0 transition-all duration-300"
                            />
                        </button>
                    </div>
                    <div id="TrustedEwalletsJ" className="flex flex-col gap-5">
                        <div className="box h-[1px] w-full" />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img
                                    src="/assets/images/thumbnails/link-aja.png"
                                    alt="image"
                                    className="h-[60px] w-[80px] shrink-0"
                                />
                                <div>
                                    <h4 className="font-semibold">LinkAja Pro</h4>
                                    <p className="text-sm leading-[21px] text-items-grey">
                                        Offline
                                    </p>
                                </div>
                            </div>
                            <span className="rounded-full bg-[#F6F6F8] px-[14px] py-2">
                                <p className="text-sm font-semibold leading-[21px] text-[#ACACB9]">
                                    Inactive
                                </p>
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img
                                    src="/assets/images/thumbnails/ovo.png"
                                    alt="image"
                                    className="h-[60px] w-[80px] shrink-0"
                                />
                                <div>
                                    <h4 className="font-semibold">OVO Inter</h4>
                                    <p className="text-sm leading-[21px] text-items-grey">
                                        Offline
                                    </p>
                                </div>
                            </div>
                            <span className="rounded-full bg-[#F6F6F8] px-[14px] py-2">
                                <p className="text-sm font-semibold leading-[21px] text-[#ACACB9]">
                                    Inactive
                                </p>
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img
                                    src="/assets/images/thumbnails/gopay.png"
                                    alt="image"
                                    className="h-[60px] w-[80px] shrink-0"
                                />
                                <div>
                                    <h4 className="font-semibold">Link Aja</h4>
                                    <p className="text-sm leading-[21px] text-items-grey">
                                        Offline
                                    </p>
                                </div>
                            </div>
                            <span className="rounded-full bg-[#F6F6F8] px-[14px] py-2">
                                <p className="text-sm font-semibold leading-[21px] text-[#ACACB9]">
                                    Inactive
                                </p>
                            </span>
                        </div>
                    </div>
                </div>
            </section>
            <section id="CasOnDelivery" className="px-5">
                <div className="flex flex-col gap-5 rounded-3xl bg-white px-[14px] py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-[10px]">
                            <img
                                src="/assets/images/icons/cash.svg"
                                alt="icon"
                                className="size-[38px] shrink-0"
                            />
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold text-[#0C0422]">Cash on Delivery</h3>
                                <p className="text-sm leading-[21px] text-[#8C8582]">
                                    Choose lorem dolor active
                                </p>
                            </div>
                        </div>
                        <button type="button" data-expand="CasOnDeliveryJ" className="shrink-0">
                            <img
                                src="/assets/images/icons/bottom.svg"
                                alt="icon"
                                className="size-6 shrink-0 transition-all duration-300"
                            />
                        </button>
                    </div>
                    <div id="CasOnDeliveryJ" className="flex flex-col gap-5">
                        <div className="box h-[1px] w-full" />
                        <div className="rounded-2xl bg-[#F6F6F8] p-[10px]">
                            <p className="text-sm">
                                Layanan pembayaran ini belum si amet tersedia karena sedang proses
                                dolor.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <section id="BankTransfer" className="px-5">
                <div className="flex flex-col gap-5 rounded-3xl bg-white px-[14px] py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-[10px]">
                            <img
                                src="/assets/images/icons/banktf.svg"
                                alt="icon"
                                className="size-[38px] shrink-0"
                            />
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold text-[#0C0422]">Bank Transfer</h3>
                                <p className="text-sm leading-[21px] text-[#8C8582]">
                                    Choose lorem dolor active
                                </p>
                            </div>
                        </div>
                        <button type="button" data-expand="BankTransferJ" className="shrink-0">
                            <img
                                src="/assets/images/icons/bottom.svg"
                                alt="icon"
                                className="size-6 shrink-0 transition-all duration-300"
                            />
                        </button>
                    </div>
                    <div id="BankTransferJ" className="flex flex-col gap-5">
                        <div className="box h-[1px] w-full" />
                        <div className="flex items-start gap-4">
                            <img
                                src="/assets/images/thumbnails/bca.png"
                                alt="image"
                                className="h-[60px] w-[81px] shrink-0"
                            />
                            <div>
                                <h4 className="text-sm leading-[21px] text-items-grey">
                                    Bank Central Asia
                                </h4>
                                <strong className="font-semibold">9893981092</strong>
                                <p className="text-sm leading-[21px] text-items-grey">
                                    PT Shayna Beauty
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <img
                                src="/assets/images/thumbnails/mandiri.png"
                                alt="image"
                                className="h-[60px] w-[81px] shrink-0"
                            />
                            <div>
                                <h4 className="text-sm leading-[21px] text-items-grey">
                                    Bank Mandiri
                                </h4>
                                <strong className="font-semibold">193084820912</strong>
                                <p className="text-sm leading-[21px] text-items-grey">
                                    PT Shayna Beauty
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5">
                <section id="PaymentConfirmation">
                    <div className="flex flex-col gap-5 rounded-3xl bg-white px-[14px] py-5">
                        <div className="flex items-center gap-[10px]">
                            <img
                                src="/assets/images/icons/information.svg"
                                alt="icon"
                                className="size-[38px] shrink-0"
                            />
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold text-[#0C0422]">
                                    Payment Confirmation
                                </h3>
                                <p className="text-sm leading-[21px] text-[#8C8582]">
                                    Upload bukti transfer lorem dor
                                </p>
                            </div>
                        </div>
                        <div className="box h-[1px] w-full" />
                        <label className="flex flex-col gap-[6px]">
                            <h4 className="font-semibold text-[#030504]">Proof of Payment</h4>
                            <div className="group relative flex h-[54px] items-center justify-center rounded-full bg-[#E0E0EC] transition-all duration-300 focus-within:bg-items-gradient-purple-pink">
                                <div className="h-[calc(100%_-_2px)] w-[calc(100%_-_2px)] rounded-full bg-[#F6F6F8] transition-all duration-300 focus-within:h-[calc(100%_-_4px)] focus-within:w-[calc(100%_-_4px)]">
                                    <p
                                        id="upload"
                                        className="absolute left-[57px] top-1/2 -translate-y-1/2 py-[15px] text-[#ACACB9]"
                                    >
                                        Add an attachment
                                    </p>
                                    <input
                                        onChange={handleChange}
                                        type="file"
                                        name="payment_proof"
                                        id="file-upload"
                                        className="absolute top-1/2 w-full -translate-y-1/2 rounded-full py-[15px] pl-[57px] pr-[13px] font-semibold text-[#030504] opacity-0 file:hidden focus:outline-none"
                                    />
                                    <div className="absolute left-[14px] top-1/2 flex w-[35px] -translate-y-1/2 justify-between">
                                        <img
                                            src="/assets/images/icons/list.svg"
                                            alt="icon"
                                            className="size-[24px] shrink-0"
                                        />
                                        <span className="h-[26px] w-px bg-[#E0E0EC] transition-all duration-300 group-focus-within:bg-items-gradient-purple-pink" />
                                    </div>
                                </div>
                            </div>
                            {formErrors.find((error) => error.path.includes("payment_proof")) && (
                                <p className="text-sm leading-[21px] text-[#E70011]">
                                    {formErrors.find((error) => error.path.includes("payment_proof"))?.message}
                                </p>
                            )}
                        </label>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-between rounded-full bg-items-gradient-pink-white px-5 py-[14px] transition-all duration-300 hover:shadow-[0px_6px_22px_0px_#FF4D9E82]"
                        >
                            <strong className="font-semibold text-white">
                                {loading ? "Mengirim..." : "Kirim Bukti Pembayaran"}
                            </strong>
                            <img
                                src="/assets/images/icons/right.svg"
                                alt="icon"
                                className="size-[24px] shrink-0"
                            />
                        </button>
                    </div>
                </section>
            </form>
        </main>
    )
}