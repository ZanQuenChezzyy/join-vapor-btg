import { Link, useParams } from "react-router-dom"
import { CartItem, Item } from "../types/type";
import { useEffect, useState } from "react";
import apiClient from "../services/apiService";
import { Swiper, SwiperSlide } from "swiper/react";

export default function DetailsPage() {
    const { slug } = useParams<{ slug: string }>();

    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [cart, setCart] = useState<CartItem[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    const [mainImage, setMainImage] = useState<string>("");

    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        apiClient
            .get(`/item/${slug}`)
            .then((response) => {
                setItem(response.data.data);
                setMainImage(response.data.data.thumbnail);
                setLoading(false);
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    }, [slug]);

    const handleAddToCart = () => {
        if (item) {
            setIsAdding(true);
            const itemExists = cart.find((produk) => produk.item_id === item.id);
            if (itemExists) {
                alert("Produk sudah ada di keranjang");
                setIsAdding(false);
            }
            else {
                const newCartItem: CartItem = {
                    item_id: item.id,
                    slug: item.slug,
                    quantity: 1,
                }

                const updatedCart = [...cart, newCartItem];
                setCart(updatedCart);

                localStorage.setItem("cart", JSON.stringify(updatedCart));

                alert("Produk berhasil ditambahkan ke keranjang");
                setIsAdding(false);
            }
        }
    };

    if (loading) {
        return <p className="text-center flex justify-center items-center min-h-screen">Memuat...</p>;
    }

    if (error) {
        return <p className="text-center flex justify-center items-center min-h-screen">Gagal Memuat Kategori: {error}</p>
    }

    if (!item) {
        return <p className="text-center flex justify-center items-center min-h-screen">Kategori Tidak Ditemukan</p>
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
                <div className="relative px-5 mt-5">
                    <div className="flex items-center justify-between w-full px-3 py-3 bg-white rounded-3xl">
                        <Link to={'/'}>
                            <div className="flex size-[44px] shrink-0 items-center justify-center rounded-full border border-items-greylight">
                                <img
                                    src="/assets/images/icons/left.svg"
                                    alt="icon"
                                    className="size-5 shrink-0"
                                />
                            </div>
                        </Link>
                        <div className="flex flex-col gap-[2px]">
                            <h1 className="text-center text-lg font-bold leading-[27px]">
                                Detail Produk
                            </h1>
                            <p className="text-center text-sm leading-[21px] text-items-grey">
                                {item.name}
                            </p>
                        </div>
                        <Link to={'/cart'}>
                            <div className="flex size-[44px] shrink-0 items-center justify-center rounded-full border border-items-greylight">
                                <img
                                    src="/assets/images/icons/cart.svg"
                                    alt="icon"
                                    className="size-5 shrink-0"
                                />
                            </div>
                        </Link>
                    </div>
                </div>
            </section>
            <div className="flex flex-col gap-5">
                <section id="HeroSlider" className="px-5">
                    <div className="flex w-full flex-col items-center gap-[30px] rounded-[30px] bg-white px-[24.5px] py-[30px]">
                        <div className="flex size-[250px] shrink-0 items-center justify-center rounded-lg overflow-hidden">
                            <img
                                src={`${BASE_URL}/${mainImage}`}
                                alt="image"
                                className="object-contain w-full h-full"
                            />
                        </div>
                        <div className="flex items-center justify-center gap-[4px]">
                            <div className={`h-[72px] w-[72px] rounded-full p-[2px] transition-all duration-300 ${mainImage === item.thumbnail ? 'bg-items-gradient-purple-pink' : ''}`}>
                                <div className="flex items-center justify-center w-full h-full bg-white rounded-full">
                                    <div className="flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full">
                                        <img
                                            src={`${BASE_URL}/${item.thumbnail}`}
                                            alt="image"
                                            className={`size-[45px] h-full w-full object-cover transition-opacity duration-500 ${mainImage === item.thumbnail ? 'opacity-100' : 'opacity-50'}`}
                                            onClick={() => setMainImage(item.thumbnail)}
                                        />
                                    </div>
                                </div>
                            </div>
                            {item.item_photos.length > 0 ? (
                                item.item_photos.map((photo) => (
                                    <div key={photo.id} className={`h-[72px] w-[72px] rounded-full p-[2px] transition-all duration-300 ${mainImage === photo.photo ? 'bg-items-gradient-purple-pink' : ''}`}>
                                        <div className="flex items-center justify-center w-full h-full bg-white rounded-full">
                                            <div className="flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full">
                                                <img
                                                    src={`${BASE_URL}/${photo.photo}`}
                                                    alt="image"
                                                    className={`size-[45px] h-full w-full object-cover transition-opacity duration-500 ${mainImage === photo.photo ? 'opacity-100' : 'opacity-50'}`}
                                                    onClick={() => setMainImage(photo.photo)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                null
                            )}
                        </div>
                    </div>
                </section>
                <header>
                    <div className="flex items-center justify-between px-5">
                        <div className="flex flex-col gap-1">
                            <h4 className="font-semibold text-items-purple">
                                {item.brand.name.toUpperCase()}
                            </h4>
                            <h1 className="text-[20px] font-bold leading-[30px]">
                                {item.name}
                            </h1>
                        </div>
                        {item.avg_rating ? (
                            <div className="rounded-[16px] bg-items-purple px-[12px] py-2">
                                <img
                                    src="/assets/images/icons/star.svg"
                                    alt="icon"
                                    className="mx-auto size-5 shrink-0"
                                />
                                <p className="font-bold text-white">
                                    {item.avg_rating}
                                </p>
                            </div>
                        ) : null}
                    </div>
                </header>
                <section id="ImportantPoints">
                    <div className="grid grid-cols-2 gap-[14px] px-5">
                        <div className="flex items-center gap-[10px] rounded-[20px] bg-white pb-[14px] pl-[14px] pt-[14px]">
                            <img
                                src="/assets/images/icons/calender.svg"
                                alt="icon"
                                className="size-[32px] shrink-0"
                            />
                            <div>
                                <h5 className="text-sm font-semibold leading-[21px] text-[#030504]">
                                    Kategori
                                </h5>
                                <p className="text-sm leading-[21px] text-[#43484C]">
                                    {item.category.name}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-[10px] rounded-[20px] bg-white pb-[14px] pl-[14px] pt-[14px]">
                            <img
                                src="/assets/images/icons/clock.svg"
                                alt="icon"
                                className="size-[32px] shrink-0"
                            />
                            <div>
                                <h5 className="text-sm font-semibold leading-[21px] text-[#030504]">
                                    Garansi
                                </h5>
                                <p className="text-sm leading-[21px] text-[#43484C]">
                                    30 Hari
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="StockProduct">
                    <div className="flex flex-col gap-2 px-5">
                        <span className="font-semibold text-sm">Stok Tersisa :
                            <span className="font-bold text-sm"> {item.stock} unit</span>
                        </span>
                    </div>
                </section>
                <section id="AboutProduct">
                    <div className="flex flex-col gap-2 px-5">
                        <h3 className="font-bold">Deskripsi</h3>
                        <p className="leading-[28px]">
                            {item.description}
                        </p>
                    </div>
                </section>
                <section id="Reviews">
                    <div id="ReviewsSlider" className="w-full overflow-x-hidden swiper">
                        <Swiper
                            className="swiper-wrapper"
                            direction="horizontal"
                            spaceBetween={16}
                            slidesPerView="auto"
                            slidesOffsetAfter={20}
                            slidesOffsetBefore={20}
                        >
                            {item.item_testimonials.length > 0 ? (
                                item.item_testimonials.map((testimonial) => (
                                    <SwiperSlide className="swiper-slide !w-fit" key={testimonial.id}>
                                        <div className="relative flex w-[330px] flex-col gap-4 rounded-3xl bg-white p-[20px]">
                                            <img
                                                src="/assets/images/icons/coma.svg"
                                                alt="icon"
                                                className="absolute left-[17px] top-[16px]"
                                            />
                                            <p className="relative leading-[28px] text-[#030504] text-sm">
                                                {testimonial.message}
                                            </p>
                                            <div className="relative flex items-center justify-between">
                                                <div className="flex items-center gap-[12px]">
                                                    <div className="flex size-[48px] shrink-0 items-center justify-center overflow-hidden rounded-full">
                                                        <img
                                                            src={`${BASE_URL}/${testimonial.photo}`}
                                                            alt="image"
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-[#030504] text-sm">
                                                            {testimonial.name}
                                                        </h5>
                                                        <p className="text-xs leading-[21px] text-items-grey">
                                                            {testimonial.rating}/5
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center stars">
                                                    {[...Array(5)].map((_, index) => (
                                                        <img
                                                            key={index}
                                                            src="/assets/images/icons/star-big.svg"
                                                            alt="icon"
                                                            className={`size-[20px] shrink-0 ${index < Math.floor(Number(testimonial.rating)) ? '' : 'opacity-30'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))
                            ) : (
                                <p>Tidak Ada Testimoni</p>
                            )}
                        </Swiper>
                    </div>
                </section>
                <section id="NaturalBenefits">
                    <div className="flex flex-col gap-[14px] px-5 pb-[125px]">
                        <h3 className="font-bold">Spesifikasi</h3>
                        {item.item_specifications.length > 0 ? (
                            item.item_specifications.map((specification) => (
                                <div className="flex items-center gap-1" key={specification.id}>
                                    <img
                                        src="/assets/images/icons/benefit.svg"
                                        alt="icon"
                                        className="size-[28px] shrink-0"
                                    />
                                    <p className="leading-[28px] text-sm">
                                        {specification.name}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p>Tidak Ada Spesifikasi</p>
                        )}
                    </div>
                </section>
            </div>
            <nav className="fixed bottom-0 left-0 right-0 z-30">
                <div className="relative mx-auto flex max-w-[640px] items-center gap-[20px] bg-white p-5">
                    <div className="flex flex-col gap-1 text-start">
                        <p className="text-sm leading-[21px] text-items-grey">
                            Harga
                        </p>
                        <strong className="whitespace-nowrap text-xl font-bold leading-[30px]">
                            {formatCurrency(item.price)}
                        </strong>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className="flex w-full items-center justify-center gap-[10px] rounded-full bg-items-gradient-pink-white py-[14px] transition-all duration-300 hover:shadow-[0px_6px_22px_0px_#FF4D9E82]"
                    >
                        <p className="font-semibold text-white w-50">
                            {isAdding ? "Menambahkan..." : "Tambah Ke Keranjang"}
                        </p>
                        <img
                            src="/assets/images/icons/cart-white.svg"
                            alt="icon"
                            className="size-[24px] shrink-0"
                        />
                    </button>
                </div>
            </nav>
        </main>
    )
}