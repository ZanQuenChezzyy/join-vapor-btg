import { Link, useParams } from "react-router-dom"
import { Category } from "../types/type";
import { useEffect, useState } from "react";
import apiClient from "../services/apiService";

export default function CategoryPage() {

    const { slug } = useParams<{ slug: string }>();
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        apiClient
            .get(`/category/${slug}`)
            .then((response) => {
                setCategory(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    }, [slug]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredItems = category?.items.filter(
        (item) =>
            item.is_displayed &&
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (loading) {
        return <p className="text-center flex justify-center items-center min-h-screen">Memuat...</p>;
    }

    if (error) {
        return <p className="text-center flex justify-center items-center min-h-screen">Gagal Memuat Kategori: {error}</p>
    }

    if (!category) {
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
        <main className="mx-auto flex min-h-screen max-w-[640px] flex-col gap-5 bg-[#F6F6F8] pb-[102px]">
            <section id="NavTop" className="mt-5 px-5">
                <div className="flex w-full flex-col gap-5 rounded-3xl bg-white px-3 pb-5 pt-3">
                    <div className="flex items-center justify-between">
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
                                Kategori
                            </h1>
                            <p className="text-center text-sm leading-[21px] text-items-grey">
                                {category.name}
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
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-[70px] shrink-0 items-center justify-center overflow-hidden rounded-full">
                                <img
                                    src={`${BASE_URL}/${category.photo}`}
                                    alt="image"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h2 className="text-lg font-bold leading-[27px]">
                                    {category.name}
                                </h2>
                                <p className="text-sm leading-[21px] text-items-grey">
                                    {category.items_count} Unit
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-[6px] mb-4">
                        <div className="relative h-[49px]">
                            <input
                                placeholder="Cari Unit Atau Barang"
                                type="text"
                                value={searchTerm}
                                onChange={handleSearch}
                                className="absolute w-full rounded-full bg-[#F6F6F8] py-[14px] pl-4 pr-[92px] font-semibold text-[#030504] placeholder:text-sm placeholder:font-normal placeholder:leading-[21px] placeholder:text-items-grey focus:outline-none"
                            />
                            <button
                                type="button"
                                className="absolute right-[6px] top-1/2 -translate-y-1/2 rounded-full px-[14px] py-2 text-sm font-semibold leading-[21px] text-white"
                            >
                                <img
                                    src="/assets/images/icons/search.svg"
                                    alt="icon"
                                    className="size-5 shrink-0"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section id="ListItems">
                <div className="flex flex-col gap-4 px-5">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <Link to={`/item/${item.slug}`} key={item.id}>
                                <div className="flex h-[130px] items-center justify-center rounded-3xl transition-all duration-300 hover:bg-items-gradient-purple-pink">
                                    <div className="flex h-full w-full hover:h-[calc(100%_-_4px)] hover:w-[calc(100%_-_4px)] transition-all duration-300 gap-4 rounded-[23px] hover:rounded-[22px] items-center bg-white px-4">
                                        <div className="flex size-[90px] shrink-0 items-center justify-center">
                                            <img
                                                src={`${BASE_URL}/${item.thumbnail}`}
                                                alt="image"
                                                className="h-full w-full object-contain"
                                            />
                                        </div>
                                        <div className="flex w-full flex-col gap-[2px]">
                                            <h4 className="text-xs leading-[18px] text-items-purple">
                                                {item.brand.name.toUpperCase()}
                                            </h4>
                                            <h3 className="line-clamp-2 h-[48px] w-full font-semibold">
                                                {item.name}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <strong className="font-semibold text-items-pink">
                                                    {formatCurrency(item.price)}
                                                </strong>
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
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p>Belum ada data kategori atau barang yang cocok dengan pencarian.</p>
                    )}
                </div>
            </section>
        </main>
    )
}