import { Swiper, SwiperSlide } from "swiper/react";
import { Brand, Category, Item } from "../types/type";
import { useEffect, useState } from "react";
import apiClient from "../services/apiService";
import { Link } from "react-router-dom";

const fetchCategories = async () => {
    const response = await apiClient.get("/categories");
    return response.data.data;
}

const fetchBrands = async () => {
    const response = await apiClient.get("/brands");
    return response.data.data;
}

const fetchPopularItems = async () => {
    const response = await apiClient.get("/items?limit=4&is_popular=1");
    return response.data.data;
}

const fetchAllItems = async () => {
    const response = await apiClient.get("/items?limit=4");
    return response.data.data;
}

export default function BrowsePage() {

    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [popularItems, setPopularItems] = useState<Item[]>([]);
    const [allItems, setAllItems] = useState<Item[]>([]);

    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingBrands, setLoadingBrands] = useState(true);
    const [loadingPopularItems, setLoadingPopularItems] = useState(true);
    const [loadingAllItems, setLoadingAllItems] = useState(true);

    const [isCategoriesExpanded, setIsCategoriesExpanded] = useState<boolean>(false);
    const [visibleCategories, setVisibleCategories] = useState<number>(3);
    const [isBrandsExpanded, setIsBrandsExpanded] = useState<boolean>(false);
    const [visibleBrands, setVisibleBrands] = useState<number>(3);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategoriesData = async () => {
            try {
                const categoriesData = await fetchCategories();
                setCategories(categoriesData);
            } catch {
                setError("Gagal Memuat Kategori");
            } finally {
                setLoadingCategories(false);
            }
        };

        const fetchBrandsData = async () => {
            try {
                const brandsData = await fetchBrands();
                setBrands(brandsData);
            } catch {
                setError("Gagal Memuat Brand / Merek");
            } finally {
                setLoadingBrands(false);
            }
        };

        const fetchPopularItemsData = async () => {
            try {
                const popularItemsData = await fetchPopularItems();

                const sortedItems = popularItemsData.sort(
                    (a: Item, b: Item) =>
                        parseFloat(a.avg_rating?.toString() || "0") < parseFloat(b.avg_rating?.toString() || "0") ? 1 : -1
                );

                setPopularItems(sortedItems);
            } catch {
                setError("Gagal Memuat Produk Unggulan");
            } finally {
                setLoadingPopularItems(false);
            }
        };

        const fetchAllItemsData = async () => {
            try {
                const allItemsData = await fetchAllItems();

                // Mengurutkan berdasarkan waktu penambahan terbaru
                const sortedItems = allItemsData.sort(
                    (a: Item, b: Item) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );

                setAllItems(sortedItems);
            } catch {
                setError("Gagal Memuat Produk");
            } finally {
                setLoadingAllItems(false);
            }
        };

        fetchCategoriesData();
        fetchBrandsData();
        fetchAllItemsData();
        fetchPopularItemsData()

    }, []);

    if (loadingCategories && loadingAllItems && loadingPopularItems && loadingBrands) {
        return <p className="text-center flex justify-center items-center min-h-screen">Memuat Data Kategori dan Produk...</p>;
    }

    if (error) {
        return <p className="text-center flex justify-center items-center min-h-screen">Memuat Data Gagal: {error}</p>;
    }

    const loadMoreCategories = () => {
        if (isCategoriesExpanded) {
            setVisibleCategories(3); // Reset jumlah kategori yang ditampilkan
            setIsCategoriesExpanded(false); // Set isExpanded ke false
        } else {
            setVisibleCategories(visibleCategories + 6); // Menambah jumlah kategori yang ditampilkan
            if (visibleCategories + 6 >= categories.length) {
                setIsCategoriesExpanded(true); // Jika semua kategori sudah ditampilkan, set isExpanded ke true
            }
        }
    };

    const loadMoreBrands = () => {
        if (isBrandsExpanded) {
            setVisibleBrands(3); // Reset jumlah kategori yang ditampilkan
            setIsBrandsExpanded(false); // Set isExpanded ke false
        } else {
            setVisibleBrands(visibleCategories + 6); // Menambah jumlah kategori yang ditampilkan
            if (visibleCategories + 6 >= categories.length) {
                setIsBrandsExpanded(true); // Jika semua kategori sudah ditampilkan, set isExpanded ke true
            }
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(value);
    };

    const BASE_URL = import.meta.env.VITE_REACT_API_STORAGE_URL;

    return (
        <main className="mx-auto flex min-h-screen max-w-[640px] flex-col gap-5 bg-white pb-[141px]">
            <section id="Info">
                <div className="mt-5 flex items-center justify-between px-5">
                    <div className="language flex h-[32px] items-center gap-[10px]">
                        <button type="button" className="indo flex items-center gap-[6px]">
                            <img
                                src="/assets/images/icons/id.svg"
                                alt="icon"
                                className="h-[15px] w-5 shrink-0"
                            />
                            <p className="text-xs font-semibold leading-[18px]">JOIN VAPOR BONTANG</p>
                        </button>
                    </div>
                    <div className="flex items-center gap-[6px]">
                        <img
                            src="/assets/images/icons/telp.svg"
                            alt="icon"
                            className="size-5 shrink-0"
                        />
                        <strong className="text-xs font-semibold leading-[18px]">
                            62821202019213
                        </strong>
                    </div>
                </div>
            </section>
            <section id="Company">
                <div className="flex justify-between px-5">
                    <a href="">
                        <img
                            src="/assets/images/logos/join.svg"
                            alt="icon"
                            className="h-[48px] w-[113px] shrink-0"
                        />
                    </a>
                    <div className="flex items-center gap-[10px]">
                        <a
                            href=""
                            className="flex size-[44px] items-center justify-center rounded-full bg-items-greylight p-px transition-all duration-300 hover:bg-items-gradient-purple-pink hover:p-[2px]"
                        >
                            <div className="flex h-full w-full shrink-0 items-center justify-center rounded-full bg-white">
                                <img
                                    src="/assets/images/icons/search.svg"
                                    alt="icon"
                                    className="size-5 shrink-0"
                                />
                            </div>
                        </a>
                        <Link
                            to={'/cart'}
                            className="flex size-[44px] items-center justify-center rounded-full bg-items-greylight p-px transition-all duration-300 hover:bg-items-gradient-purple-pink hover:p-[2px]"
                        >
                            <div className="flex h-full w-full shrink-0 items-center justify-center rounded-full bg-white">
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
            <section id="Hero">
                <div id="HeroSlider" className="swiper w-full overflow-x-hidden">
                    <Swiper
                        className="swiper-wrapper"
                        direction="horizontal"
                        spaceBetween={16}
                        slidesPerView="auto"
                        slidesOffsetAfter={20}
                        slidesOffsetBefore={20}
                    >
                        <SwiperSlide className="swiper-slide !w-fit">
                            <a href="">
                                <div className="flex h-[190px] w-[320px] items-center justify-center overflow-hidden rounded-3xl">
                                    <img
                                        src="/assets/images/thumbnails/promo-thumb.png"
                                        alt="image"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </a>
                        </SwiperSlide>
                        <SwiperSlide className="swiper-slide !w-fit">
                            <a href="">
                                <div className="flex h-[190px] w-[320px] items-center justify-center overflow-hidden rounded-3xl">
                                    <img
                                        src="/assets/images/thumbnails/special-thumb.png"
                                        alt="image"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </a>
                        </SwiperSlide>
                    </Swiper>
                </div>
            </section>
            <section id="TopCategories">
                <div className="flex flex-col gap-4 px-5">
                    <h2 className="font-bold">Kategori</h2>
                    <div className="categories-cards grid grid-cols-3 gap-4">
                        {categories.length > 0 ? (
                            categories.slice(0, visibleCategories).map((category) => (
                                <Link to={`/category/${category.slug}`} key={category.id}>
                                    <div className="flex h-[142px] items-center justify-center rounded-3xl bg-items-greylight p-px transition-all duration-300 hover:bg-items-gradient-purple-pink hover:p-[2px]">
                                        <div className="flex h-full w-full flex-col justify-center rounded-[23px] bg-white px-[10px] hover:rounded-[22px]">
                                            <div className="mx-auto mb-[10px] flex size-[60px] items-center justify-center overflow-hidden rounded-full">
                                                <img
                                                    src={`${BASE_URL}/${category.photo}`}
                                                    alt="image"
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <h3 className="mb-[2px] text-center text-sm font-semibold leading-[21px]">
                                                {category.name}
                                            </h3>
                                            <p className="text-center text-sm leading-[21px] text-items-grey">
                                                {category.items_count} unit
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="text-center">Belum ada data Kategori</p>
                        )}
                    </div>
                    {categories.length > 3 && (
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={loadMoreCategories}
                                className="rounded-full border border-black px-4 py-2 text-xs font-semibold transition-shadow duration-300 hover:shadow-lg"
                            >
                                {isCategoriesExpanded ? "Tutup Selengkapnya" : "Lihat Selengkapnya"}
                            </button>
                        </div>
                    )}
                </div>
            </section>
            <section id="TopBrands">
                <div className="flex flex-col gap-4 px-5">
                    <h2 className="font-bold">Merek atau Brand</h2>
                    <div className="categories-cards grid grid-cols-3 gap-4">
                        {brands.length > 0 ? (
                            brands.slice(0, visibleBrands).map((brand) => (
                                <Link to={`/brand/${brand.slug}`} key={brand.id}>
                                    <div className="flex h-[142px] items-center justify-center rounded-3xl bg-items-greylight p-px transition-all duration-300 hover:bg-items-gradient-purple-pink hover:p-[2px]">
                                        <div className="flex h-full w-full flex-col justify-center rounded-[23px] bg-white px-[10px] hover:rounded-[22px]">
                                            <div className="mx-auto mb-[10px] flex size-[60px] items-center justify-center overflow-hidden rounded-full">
                                                <img
                                                    src={`${BASE_URL}/${brand.photo}`}
                                                    alt="image"
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <h3 className="mb-[2px] text-center text-sm font-semibold leading-[21px]">
                                                {brand.name}
                                            </h3>
                                            <p className="text-center text-sm leading-[21px] text-items-grey">
                                                {brand.items_count} unit
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="text-center col-span-3">Belum ada data Brand</p>
                        )}
                    </div>
                    {brands.length > 3 && (
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={loadMoreBrands}
                                className="rounded-full border border-black px-4 py-2 text-xs font-semibold transition-shadow duration-300 hover:shadow-lg"
                            >
                                {isBrandsExpanded ? "Tutup Selengkapnya" : "Lihat Selengkapnya"}
                            </button>
                        </div>
                    )}
                </div>
            </section>
            <section id="PopularChoices">
                <div className="flex flex-col gap-4 bg-[#F6F6F8] pb-[30px] pt-5">
                    <h2 className="px-5 font-bold">Produk Unggulan</h2>
                    <div
                        id="PopularChoicesSlider"
                        className="swiper w-full overflow-x-hidden"
                    >
                        <Swiper
                            className="swiper-wrapper"
                            direction="horizontal"
                            spaceBetween={14}
                            slidesPerView="auto"
                            slidesOffsetAfter={20}
                            slidesOffsetBefore={20}
                        >
                            {popularItems.length > 0 ? (
                                popularItems.filter((item) => item.is_displayed)
                                    .map((item) => (
                                        <SwiperSlide className="swiper-slide !w-fit" key={item.id}>
                                            <Link to={`/item/${item.slug}`}>
                                                <div className="relative flex h-[276px] w-[222px] items-center justify-center rounded-3xl transition-all duration-300 hover:bg-items-gradient-purple-pink hover:p-[2px]">
                                                    <div className="flex h-full w-full flex-col justify-center gap-4 rounded-[23px] bg-white px-4 hover:rounded-[22px]">
                                                        {item.avg_rating ? (
                                                            <span className="absolute right-[14px] top-[14px] flex items-center justify-center gap-[2px] rounded-full bg-items-purple px-2 py-[6px]">
                                                                <img
                                                                    src="/assets/images/icons/star.svg"
                                                                    alt="icon"
                                                                    className="size-4 shrink-0"
                                                                />
                                                                <p className="text-xs font-bold leading-[18px] text-white">
                                                                    {item.avg_rating}
                                                                </p>
                                                            </span>
                                                        ) : null}
                                                        <div className="mx-auto flex h-[130px] w-full items-center justify-center">
                                                            <img
                                                                src={`${BASE_URL}/${item.thumbnail}`}
                                                                alt="image"
                                                                className="h-full w-full object-contain"
                                                            />
                                                        </div>
                                                        <div className="des flex flex-col gap-1">
                                                            <div className="flex justify-between">
                                                                <h4 className="text-xs leading-[18px] text-items-purple">
                                                                    {item.brand.name.toUpperCase()}
                                                                </h4>
                                                                <h6 className="text-xs font-semibold">
                                                                    {item.category.name}
                                                                </h6>
                                                            </div>
                                                            <h3 className="line-clamp-2 h-[48px] w-full font-semibold">
                                                                {item.name}
                                                            </h3>
                                                            <strong className="font-semibold text-items-pink">
                                                                {formatCurrency(item.price)}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </SwiperSlide>
                                    ))
                            ) : (
                                <p>Belum Ada Produk Unggulan</p>
                            )}
                        </Swiper>
                    </div>
                </div>
            </section>
            <section id="FreshThisSummer">
                <div className="flex flex-col gap-4 px-5">
                    <h2 className="font-bold">Produk Terbaru</h2>
                    {allItems.length > 0 ? (
                        allItems
                            .filter((item) => item.is_displayed)
                            .map((item) => (
                                <Link to={`/item/${item.slug}`} key={item.id}>
                                    <div className="flex h-[130px] items-center justify-center rounded-3xl bg-items-greylight p-px transition-all duration-300 hover:bg-items-gradient-purple-pink hover:p-[2px]">
                                        <div className="flex h-full w-full items-center gap-4 rounded-[23px] bg-white px-4 hover:rounded-[22px]">
                                            <div className="flex size-[90px] shrink-0 items-center justify-center">
                                                <img
                                                    src={`${BASE_URL}/${item.thumbnail}`}
                                                    alt="image"
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>
                                            <div className="flex w-full flex-col gap-[2px]">
                                                <div className="flex justify-between">
                                                    <h4 className="text-xs leading-[18px] text-items-purple">
                                                        {item.brand.name.toUpperCase()}
                                                    </h4>
                                                    <h6 className="text-xs font-semibold">
                                                        {item.category.name}
                                                    </h6>
                                                </div>

                                                <h3 className="line-clamp-2 h-[48px] w-full font-semibold">
                                                    {item.name}
                                                </h3>
                                                <div className="flex items-center justify-between">
                                                    <strong className="font-semibold text-items-pink">
                                                        {formatCurrency(item.price)}
                                                    </strong>
                                                    {item.avg_rating ? (
                                                        <div className="flex items-center justify-center gap-[2px]">
                                                            <img
                                                                src="/assets/images/icons/star.svg"
                                                                alt="icon"
                                                                className="size-4 shrink-0"
                                                            />
                                                            <p className="text-xs font-bold leading-[18px]">
                                                                {item.avg_rating}
                                                            </p>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                    ) : (
                        <p>Belum ada Produk Terbaru</p>
                    )}

                </div>
            </section>
            {/* <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto w-full">
                <div className="mx-auto max-w-[640px]">
                    <div className="h-[89px] bg-white px-[30px] shadow-[0px_-4px_30px_0px_#1107260D]">
                        <ul className="flex justify-between">
                            <li className="flex items-center">
                                <a href="">
                                    <div className="flex w-[50px] flex-col items-center gap-1">
                                        <img
                                            src="/assets/images/icons/browse.svg"
                                            alt="icon"
                                            className="size-6 shrink-0"
                                        />
                                        <p className="text-sm font-semibold leading-[21px] text-items-pink">
                                            Menu
                                        </p>
                                    </div>
                                </a>
                            </li>
                            <li className="flex items-center">
                                <a href="view-orders.html">
                                    <div className="flex w-[50px] flex-col items-center gap-1">
                                        <img
                                            src="/assets/images/icons/car.svg"
                                            alt="icon"
                                            className="size-6 shrink-0"
                                        />
                                        <p className="text-sm leading-[21px]">
                                            Katalog
                                        </p>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="" className="relative -top-[23px]">
                                    <div className="relative flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[#FAF9FA]">
                                        <div className="flex size-[65px] items-center justify-center rounded-full bg-items-gradient-pink-white transition-shadow duration-300 hover:shadow-[0px_6px_10px_0px_#FF4D9E6E]">
                                            <img
                                                src="/assets/images/icons/video.svg"
                                                alt="icon"
                                                className="size-[30px] shrink-0"
                                            />
                                        </div>
                                    </div>
                                </a>
                            </li>
                            <li className="flex items-center">
                                <a href="">
                                    <div className="flex w-[50px] flex-col items-center gap-1">
                                        <img
                                            src="/assets/images/icons/gift.svg"
                                            alt="icon"
                                            className="size-6 shrink-0"
                                        />
                                        <p className="text-sm leading-[21px]">
                                            Promo
                                        </p>
                                    </div>
                                </a>
                            </li>
                            <li className="flex items-center">
                                <a href="">
                                    <div className="flex w-[50px] flex-col items-center gap-1">
                                        <img
                                            src="/assets/images/icons/message.svg"
                                            alt="icon"
                                            className="size-6 shrink-0"
                                        />
                                        <p className="text-sm leading-[21px]">
                                            Bantuan
                                        </p>
                                    </div>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav> */}
        </main>
    )
}