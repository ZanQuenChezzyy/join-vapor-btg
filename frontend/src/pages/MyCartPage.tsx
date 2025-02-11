import { useEffect, useState } from "react";
import { CartItem, Discount, Item } from "../types/type"
import apiClient from "../services/apiService";
import { Link } from "react-router-dom";

export default function MyCartPage() {

    const [itemDetails, setItemDetails] = useState<Item[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [discountCode, setDiscountCode] = useState<string | null>(null);
    const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
    const [discountAmount, setDiscountAmount] = useState<number>(0);

    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            const cartItems: CartItem[] = JSON.parse(savedCart);
            setCart(cartItems);

            const fetchItemDetails = async () => {
                const validItems: Item[] = [];
                const updatedCart: CartItem[] = [];

                for (const item of cartItems) {
                    try {
                        const response = await apiClient.get(`/item/${item.slug}`);
                        const produk = response.data.data;

                        if (produk) {
                            validItems.push(produk);
                            updatedCart.push(item);
                        } else {
                            console.warn(`Produk ${item.slug} Telah Tidak ada`);
                        }
                    } catch (error: unknown) {
                        if (error instanceof Error) {
                            setError(error.message);
                            console.error(`Gagal Memuat Produk ${item.slug} : ${error.message}`);
                        };
                        const updatedCartAfterError = cartItems.filter(
                            (cartItem) => cartItem.slug !== item.slug
                        );
                        setCart(updatedCartAfterError);
                        localStorage.setItem("cart", JSON.stringify(updatedCartAfterError));
                    }
                }

                setItemDetails(validItems);
                setLoading(false);

                // Check for discount in localStorage
                const storedDiscountData = JSON.parse(localStorage.getItem("appliedDiscount") || "null");

                if (storedDiscountData) {
                    setAppliedDiscount(storedDiscountData.discount);
                    setDiscountAmount(storedDiscountData.discountAmount);
                    setDiscountCode(storedDiscountData.code);
                }
            };

            fetchItemDetails();
        } else {
            setLoading(false);
        }
    }, []);

    const handleIncreaseQuantity = (slug: string) => {
        let alertShown = false;
        setCart((prevCart) => {
            const updatedCart = prevCart.map((item) => {
                const itemDetail = itemDetails.find((detail) => detail.slug === slug);
                if (item.slug === slug && itemDetail) {
                    if (item.quantity < itemDetail.stock) {
                        return { ...item, quantity: item.quantity + 1 };
                    } else if (!alertShown) {
                        alert(`Tidak bisa menambahkan Kuantitas, Stok produk ${itemDetail.name} hanya tersisa ${itemDetail.stock} Unit`);
                        alertShown = true;
                    }
                }
                return item;
            });

            localStorage.setItem("cart", JSON.stringify(updatedCart));

            const newSubtotal = updatedCart.reduce((acc, item) => {
                const itemDetail = itemDetails.find((detail) => detail.id === item.item_id);
                return acc + (itemDetail ? itemDetail.price * item.quantity : 0);
            }, 0);

            if (appliedDiscount) {
                calculateDiscountAmount(appliedDiscount, newSubtotal);
            }

            return updatedCart;
        });
    };

    const handleDecreaseQuantity = (slug: string) => {
        setCart((prevCart) => {
            const updatedCart = prevCart.map((item) =>
                item.slug === slug && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            );

            localStorage.setItem("cart", JSON.stringify(updatedCart));

            const newSubtotal = updatedCart.reduce((acc, item) => {
                const itemDetail = itemDetails.find((detail) => detail.id === item.item_id);
                return acc + (itemDetail ? itemDetail.price * item.quantity : 0);
            }, 0);

            // Check applied discount in local storage
            const storedDiscountData = JSON.parse(localStorage.getItem("appliedDiscount") || "null");

            if (storedDiscountData) {
                const appliedDiscount = storedDiscountData.discount;

                if (newSubtotal < appliedDiscount.min_order_value) {
                    setAppliedDiscount(null);
                    setDiscountAmount(0);
                    setDiscountCode("");
                    localStorage.removeItem("appliedDiscount");
                    alert("Diskon dibatalkan karena subtotal di bawah batas minimum pembelian.");
                }
            }

            return updatedCart;
        });
    };

    const handleRemoveFromCart = (slug: string) => {
        const updatedCart = cart.filter((item) => item.slug !== slug);
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));

        setItemDetails((prevDetails) =>
            prevDetails.filter((detail) => detail.slug !== slug)
        );

        const newSubtotal = updatedCart.reduce((acc, item) => {
            const itemDetail = itemDetails.find((detail) => detail.id === item.item_id);
            return acc + (itemDetail ? itemDetail.price * item.quantity : 0);
        }, 0);

        if (appliedDiscount) {
            if (newSubtotal >= appliedDiscount.min_order_value) {
                calculateDiscountAmount(appliedDiscount, newSubtotal);
            } else {
                setAppliedDiscount(null);
                setDiscountAmount(0);
                setDiscountCode("");
                alert("Diskon dibatalkan karena subtotal di bawah batas minimum pembelian.");
            }
        }
    };

    const calculateDiscountAmount = (discount: Discount, updatedSubtotal: number) => {
        let discountValue = 0;

        if (updatedSubtotal < discount.min_order_value) {
            alert(`Subtotal Anda belum memenuhi syarat minimum Rp ${discount.min_order_value.toLocaleString()} untuk diskon ini.`);
            setDiscountAmount(0);
            setAppliedDiscount(null);
            setDiscountCode("");
            return;
        }

        if (discount.type === 0) {
            // Diskon Persentase
            discountValue = (updatedSubtotal * discount.value) / 100;
        } else if (discount.type === 1) {
            // Diskon Fixed
            discountValue = discount.value;
        }

        if (discount.max_order_value) {
            discountValue = Math.min(discountValue, discount.max_order_value);
        }

        setDiscountAmount(discountValue);
        console.log("Final discount calculated:", discountValue);
    };

    const handleApplyDiscount = async () => {
        if (!discountCode) {
            alert("Masukkan kode diskon terlebih dahulu.");
            return;
        }

        try {
            const response = await apiClient.get(`/discount/${discountCode}`);
            const discount: Discount = response.data.data;

            if (!discount.is_active) {
                alert("Kode diskon tidak valid atau sudah tidak aktif.");
                return;
            }

            if (subtotal < discount.min_order_value) {
                alert(`Subtotal Anda belum memenuhi syarat minimum Rp ${discount.min_order_value.toLocaleString()} untuk menggunakan diskon ini.`);

                // Hapus diskon dari localStorage jika subtotal tidak memenuhi syarat
                localStorage.removeItem("appliedDiscount");
                setAppliedDiscount(null);
                setDiscountAmount(0);
                return;
            }

            setAppliedDiscount(discount);

            // Hitung nilai diskon langsung dan simpan ke localStorage
            let discountValue = 0;

            if (discount.type === 0) {
                // Diskon Persentase
                discountValue = (subtotal * discount.value) / 100;
            } else if (discount.type === 1) {
                // Diskon Fixed
                discountValue = discount.value;
            }

            if (discount.max_order_value) {
                discountValue = Math.min(discountValue, discount.max_order_value);
            }

            setDiscountAmount(discountValue);

            // Simpan ke localStorage dengan nilai diskon yang telah dihitung
            const discountData = {
                code: discountCode,
                discount: discount,
                discountAmount: discountValue,
            };

            localStorage.setItem("appliedDiscount", JSON.stringify(discountData));

            alert("Diskon berhasil diterapkan!");
            console.log("Discount Response: ", response.data);
        } catch (error) {
            console.error("Gagal mendapatkan diskon:", error);
            alert("Gagal menerapkan diskon.");
        }
    };

    const subtotal = itemDetails.reduce((acc, item) => {
        const cartProduk = cart.find((produk) => produk.item_id === item.id);
        return acc + (cartProduk ? item.price * cartProduk.quantity : 0);
    }, 0);

    const totalQuantity = cart.reduce((acc, produk) => acc + produk.quantity, 0);

    const tax = subtotal * 0.003;
    const total = subtotal + tax - discountAmount;

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

    const BASE_URL = import.meta.env.VITE_REACT_API_STORAGE_URL;

    return (
        <main className="mx-auto flex min-h-screen max-w-[640px] flex-col gap-5 bg-[#F6F6F8]">
            <section id="NavTop">
                <div className="px-5">
                    <div className="relative mt-5 w-full rounded-3xl bg-white py-3">
                        <Link to={'/'}>
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
                                Keranjang
                            </h1>
                            <p className="text-center text-sm leading-[21px] text-items-grey">
                                Keranjang Anda
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <div className="flex flex-col gap-5">
                <section id="ListItems">
                    <div className="flex flex-col gap-[16px] px-5">
                        {itemDetails.length === 0 ? (
                            <p className="text-center text-sm leading-[21px] text-items-grey">
                                Anda belum menambahkan item apapun
                            </p>
                        ) : (
                            itemDetails.map((produk) => {
                                const cartProduk = cart.find(
                                    (item) => item.item_id === produk.id
                                );
                                return (
                                    <div
                                        key={produk.id}
                                        id="Item"
                                        className="flex h-[143px] items-center justify-center rounded-3xl transition-all duration-300 hover:bg-items-gradient-purple-pink hover:p-[2px]"
                                    >
                                        <div className="flex h-full w-full flex-col justify-center gap-[12px] rounded-[23px] bg-white px-4 hover:rounded-[22px]">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex size-[60px] shrink-0 items-center justify-center">
                                                        <img
                                                            src={`${BASE_URL}/${produk.thumbnail}`}
                                                            alt="image"
                                                            className="h-full w-full object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-[6px]">
                                                        <h4 className="text-xs leading-[18px] text-items-purple">
                                                            {produk.brand.name.toUpperCase()}
                                                        </h4>
                                                        <h3 className="line-clamp-2 h-[42px] w-full text-sm font-semibold leading-[21px]">
                                                            {produk.name}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveFromCart(produk.slug)}
                                                    className="shrink-0">
                                                    <img
                                                        src="/assets/images/icons/garbage.svg"
                                                        alt="icon"
                                                        className="size-5 shrink-0"
                                                    />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm leading-[21px] text-items-grey">
                                                    <strong className="text-sm font-semibold leading-[21px] text-items-pink">
                                                        {formatCurrency(produk.price)}
                                                    </strong>
                                                    /unit
                                                </p>
                                                <div className="flex w-[89px] items-center justify-between gap-1 rounded-full bg-[#F6F6F8] px-2 py-[6px]">
                                                    <button onClick={() => handleDecreaseQuantity(produk.slug)}>
                                                        <img
                                                            src="/assets/images/icons/min.svg"
                                                            alt="icon"
                                                            className="h-[21px] w-5 shrink-0"
                                                        />
                                                    </button>
                                                    <p className="text-center text-xs font-semibold leading-[21px]">
                                                        {cartProduk?.quantity || 1}
                                                    </p>
                                                    <button onClick={() => handleIncreaseQuantity(produk.slug)}>
                                                        <img
                                                            src="/assets/images/icons/plus.svg"
                                                            alt="icon"
                                                            className="h-[21px] w-5 shrink-0"
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </section>
                <section id="BookingDetails">
                    <div className="flex flex-col gap-5 rounded-t-[30px] rounded-b-[30px] bg-white px-5 pb-[30px] pt-[30px]">
                        <h2 className="font-bold">Detail Keranjang</h2>
                        <div className="flex flex-col gap-[6px]">
                            <div className="relative h-[49px]">
                                <input
                                    placeholder="(Opsional) Masukkan Kode Diskon"
                                    type="text"
                                    value={discountCode || ""}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    className="absolute w-full rounded-full bg-[#F6F6F8] py-[14px] pl-4 pr-[92px] font-semibold text-[#030504] placeholder:text-sm placeholder:font-normal placeholder:leading-[21px] placeholder:text-items-grey focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleApplyDiscount}
                                    className="absolute right-[6px] top-1/2 -translate-y-1/2 rounded-full bg-items-purple px-[14px] py-2 text-sm font-semibold leading-[21px] text-white"
                                >
                                    Kirim
                                </button>
                            </div>
                            {appliedDiscount && (
                                <p className="py-2 text-sm leading-[21px] text-items-grey">
                                    {appliedDiscount.description}
                                </p>
                            )}
                        </div>
                        <div className="box h-[1px] w-full" />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-[6px]">
                                <img
                                    src="/assets/images/icons/note.svg"
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
                                    src="/assets/images/icons/note.svg"
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
                                    src="/assets/images/icons/note.svg"
                                    alt="icon"
                                    className="size-5 shrink-0"
                                />
                                <p>Kode Diskon</p>
                            </div>
                            <strong className="font-semibold">{formatCurrency(discountAmount)}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-[6px]">
                                <img
                                    src="/assets/images/icons/note.svg"
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
                                    src="/assets/images/icons/note.svg"
                                    alt="icon"
                                    className="size-5 shrink-0"
                                />
                                <p>Total</p>
                            </div>
                            <strong className="text-[22px] font-bold leading-[33px] text-items-pink">
                                {formatCurrency(total)}
                            </strong>
                        </div>
                        {cart.length !== 0 && (
                            <Link to={'/transaction'}
                                className="flex w-full items-center justify-between rounded-full bg-items-gradient-pink-white px-5 py-[14px] transition-all duration-300 hover:shadow-[0px_6px_22px_0px_#FF4D9E82]"
                            >
                                <strong className="font-semibold text-white">
                                    Lanjutkan Transaksi
                                </strong>
                                <img
                                    src="/assets/images/icons/right.svg"
                                    alt="icon"
                                    className="size-[24px] shrink-0"
                                />
                            </Link>
                        )}
                    </div>
                </section>
            </div>
        </main>
    )
}