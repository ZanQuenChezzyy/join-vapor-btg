import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BillingFormData } from "../types/type";
import { z } from "zod";
import { billingSchema } from "../types/validationBilling";

export default function BillingPage() {

    const [formData, setFormData] = useState<BillingFormData>({
        name: "",
        email: "",
        phone: "",
        post_code: "",
        address: "",
        city: "",
    });

    const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        const savedData = localStorage.getItem("billingData");
        const cartData = localStorage.getItem("cart");

        if (!cartData || JSON.parse(cartData).length === 0) {
            navigate('/');
            return;
        }
        if (savedData) {
            setFormData(JSON.parse(savedData));
        }

    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const validation = billingSchema.safeParse(formData);

        if (!validation.success) {
            setFormErrors(validation.error.issues);
            return;
        }

        localStorage.setItem("billingData", JSON.stringify(formData));
        alert("Informasi Transaksi Telah Disimpan");

        navigate("/payment");

        setFormErrors([]);
    }


    return (
        <main className="mx-auto flex min-h-screen max-w-[640px] flex-col gap-5 bg-[#F6F6F8] pb-[20px]">
            <section id="NavTop">
                <div className="px-5">
                    <div className="mt-5 flex w-full flex-col gap-5 rounded-3xl bg-white pb-[44px] pt-3">
                        <div className="relative">
                            <Link to={'/cart'}>
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
                                    Transaksi
                                </h1>
                                <p className="text-center text-sm leading-[21px] text-items-grey">
                                    Formulir Transaksi
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
                                    <div className="left-0 h-2 w-1/2 rounded-full bg-[#EDEDF5]" />
                                    <div className="absolute right-1/2 top-0 translate-x-1/2">
                                        <div className="flex flex-col items-center gap-[6px]">
                                            <div className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#D8D8E4] text-xs font-bold leading-[18px]">
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
                                    <div className="h-2 w-[60px] rounded-full bg-[#EDEDF5]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <header>
                <div className="flex flex-col gap-1 px-5">
                    <h2 className="text-[26px] font-bold leading-[39px]">Mulai Transaksi</h2>
                    <p className="text-items-grey">Data asli harus diberikan!</p>
                </div>
            </header>
            <div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5">
                    <section id="Informations">
                        <div className="flex flex-col gap-5 rounded-3xl bg-white px-[14px] py-5">
                            <div className="flex items-center gap-[10px]">
                                <img
                                    src="/assets/images/icons/information.svg"
                                    alt="icon"
                                    className="size-[38px] shrink-0"
                                />
                                <div className="flex flex-col gap-1">
                                    <h3 className="font-semibold text-[#030504]">Informasi</h3>
                                    <p className="text-sm leading-[21px] text-[#43484C]">
                                        Masukkan data diri dengan lengkap & benar!
                                    </p>
                                </div>
                            </div>
                            <div className="box h-[1px] w-full" />
                            <label className="flex flex-col gap-[6px]">
                                <h4 className="font-semibold text-[#030504]">Nama Lengkap</h4>
                                <div className="group relative flex h-[54px] items-center justify-center rounded-full bg-[#E0E0EC] transition-all duration-300 focus-within:bg-items-gradient-purple-pink">
                                    <input
                                        value={formData.name}
                                        onChange={handleChange}
                                        type="text"
                                        name="name"
                                        className="absolute h-[calc(100%_-_2px)] w-[calc(100%_-_2px)] rounded-full bg-[#F6F6F8] pl-[57px] pr-[13px] font-semibold text-[#030504] transition-all duration-300 placeholder:font-normal placeholder:leading-[24px] placeholder:text-[#ACACB9] focus:h-[calc(100%_-_4px)] focus:w-[calc(100%_-_4px)] focus:outline-none"
                                        placeholder="Masukkan Nama Lengkap"
                                    />
                                    <div className="absolute left-[14px] top-1/2 flex w-[35px] -translate-y-1/2 justify-between">
                                        <img
                                            src="/assets/images/icons/profil.svg"
                                            alt="icon"
                                            className="size-[24px] shrink-0"
                                        />
                                        <span className="h-[26px] w-px bg-[#E0E0EC] transition-all duration-300 group-focus-within:bg-items-gradient-purple-pink" />
                                    </div>
                                </div>
                                {formErrors.find((error) => error.path.includes("name")) && (
                                    <p className="text-sm leading-[21px] text-[#E70011]">
                                        {formErrors.find((error) => error.path.includes("name"))?.message}
                                    </p>
                                )}
                            </label>
                            <label className="flex flex-col gap-[6px]">
                                <h4 className="font-semibold text-[#030504]">Nomor Handphone</h4>
                                <div className="group relative flex h-[54px] items-center justify-center rounded-full bg-[#E0E0EC] transition-all duration-300 focus-within:bg-items-gradient-purple-pink">
                                    <input
                                        value={formData.phone}
                                        onChange={handleChange}
                                        type="text"
                                        name="phone"
                                        className="absolute h-[calc(100%_-_2px)] w-[calc(100%_-_2px)] rounded-full bg-[#F6F6F8] pl-[57px] pr-[13px] font-semibold text-[#030504] transition-all duration-300 placeholder:font-normal placeholder:leading-[24px] placeholder:text-[#ACACB9] focus:h-[calc(100%_-_4px)] focus:w-[calc(100%_-_4px)] focus:outline-none"
                                        placeholder="Masukkan No Handphone"
                                    />
                                    <div className="absolute left-[14px] top-1/2 flex w-[35px] -translate-y-1/2 justify-between">
                                        <img
                                            src="/assets/images/icons/phone.svg"
                                            alt="icon"
                                            className="size-[24px] shrink-0"
                                        />
                                        <span className="h-[26px] w-px bg-[#E0E0EC] transition-all duration-300 group-focus-within:bg-items-gradient-purple-pink" />
                                    </div>
                                </div>
                                {formErrors.find((error) => error.path.includes("phone")) && (
                                    <p className="text-sm leading-[21px] text-[#E70011]">
                                        {formErrors.find((error) => error.path.includes("phone"))?.message}
                                    </p>
                                )}
                            </label>
                            <label className="flex flex-col gap-[6px]">
                                <h4 className="font-semibold text-[#030504]">Alamat Email</h4>
                                <div className="group relative flex h-[54px] items-center justify-center rounded-full bg-[#E0E0EC] transition-all duration-300 focus-within:bg-items-gradient-purple-pink">
                                    <input
                                        value={formData.email}
                                        onChange={handleChange}
                                        type="email"
                                        name="email"
                                        className="absolute h-[calc(100%_-_2px)] w-[calc(100%_-_2px)] rounded-full bg-[#F6F6F8] pl-[57px] pr-[13px] font-semibold text-[#030504] transition-all duration-300 placeholder:font-normal placeholder:leading-[24px] placeholder:text-[#ACACB9] focus:h-[calc(100%_-_4px)] focus:w-[calc(100%_-_4px)] focus:outline-none"
                                        placeholder="Masukkan Alamat Email"
                                    />
                                    <div className="absolute left-[14px] top-1/2 flex w-[35px] -translate-y-1/2 justify-between">
                                        <img
                                            src="/assets/images/icons/mail.svg"
                                            alt="icon"
                                            className="size-[24px] shrink-0"
                                        />
                                        <span className="h-[26px] w-px bg-[#E0E0EC] transition-all duration-300 group-focus-within:bg-items-gradient-purple-pink" />
                                    </div>
                                </div>
                                {formErrors.find((error) => error.path.includes("email")) && (
                                    <p className="text-sm leading-[21px] text-[#E70011]">
                                        {formErrors.find((error) => error.path.includes("email"))?.message}
                                    </p>
                                )}
                            </label>
                        </div>
                    </section>
                    <section id="ShippingTo">
                        <div className="flex flex-col gap-5 rounded-3xl bg-white px-[14px] py-5">
                            <div className="flex items-center gap-[10px]">
                                <img
                                    src="/assets/images/icons/shippingto.svg"
                                    alt="icon"
                                    className="size-[38px] shrink-0"
                                />
                                <div className="flex flex-col gap-1">
                                    <h3 className="font-semibold text-[#030504]">Alamat Pengiriman</h3>
                                    <p className="text-sm leading-[21px] text-[#43484C]">
                                        Masukkan alamat pengiriman dengan lengkap & benar!
                                    </p>
                                </div>
                            </div>
                            <div className="box h-[1px] w-full" />
                            <label className="flex flex-col gap-[6px]">
                                <h4 className="font-semibold text-[#030504]">Kota</h4>
                                <div className="group relative flex h-[54px] items-center justify-center rounded-full bg-[#E0E0EC] transition-all duration-300 focus-within:bg-items-gradient-purple-pink">
                                    <input
                                        value={formData.city}
                                        onChange={handleChange}
                                        type="text"
                                        name="city"
                                        className="absolute h-[calc(100%_-_2px)] w-[calc(100%_-_2px)] rounded-full bg-[#F6F6F8] pl-[57px] pr-[13px] font-semibold text-[#030504] transition-all duration-300 placeholder:font-normal placeholder:leading-[24px] placeholder:text-[#ACACB9] focus:h-[calc(100%_-_4px)] focus:w-[calc(100%_-_4px)] focus:outline-none"
                                        placeholder="Masukkan Kota"
                                    />
                                    <div className="absolute left-[14px] top-1/2 flex w-[35px] -translate-y-1/2 justify-between">
                                        <img
                                            src="/assets/images/icons/city.svg"
                                            alt="icon"
                                            className="size-[24px] shrink-0"
                                        />
                                        <span className="h-[26px] w-px bg-[#E0E0EC] transition-all duration-300 group-focus-within:bg-items-gradient-purple-pink" />
                                    </div>
                                </div>
                                {formErrors.find((error) => error.path.includes("city")) && (
                                    <p className="text-sm leading-[21px] text-[#E70011]">
                                        {formErrors.find((error) => error.path.includes("city"))?.message}
                                    </p>
                                )}
                            </label>
                            <label className="flex flex-col gap-[6px]">
                                <h4 className="font-semibold text-[#030504]">Alamat Lengkap</h4>
                                <div className="group relative flex h-[130px] items-center justify-center rounded-3xl bg-[#E0E0EC] transition-all duration-300 focus-within:bg-items-gradient-purple-pink">
                                    <textarea
                                        value={formData.address}
                                        onChange={handleChange}
                                        name="address"
                                        className="absolute h-[calc(100%_-_2px)] w-[calc(100%_-_2px)] resize-none rounded-3xl bg-[#F6F6F8] pl-[57px] pr-[13px] pt-[13px] font-semibold text-[#030504] transition-all duration-300 placeholder:font-normal placeholder:leading-[24px] placeholder:text-[#ACACB9] focus:h-[calc(100%_-_4px)] focus:w-[calc(100%_-_4px)] focus:rounded-[22px] focus:outline-none"
                                        placeholder="Masukkan alamat lengkap"
                                    />
                                    <div className="absolute left-[14px] top-[13px] flex w-[35px] justify-between">
                                        <img
                                            src="/assets/images/icons/apartment.svg"
                                            alt="icon"
                                            className="size-[24px] shrink-0"
                                        />
                                        <span className="h-[26px] w-px bg-[#E0E0EC] transition-all duration-300 group-focus-within:bg-items-gradient-purple-pink" />
                                    </div>
                                </div>
                                {formErrors.find((error) => error.path.includes("address")) && (
                                    <p className="text-sm leading-[21px] text-[#E70011]">
                                        {formErrors.find((error) => error.path.includes("address"))?.message}
                                    </p>
                                )}
                            </label>
                            <label className="flex flex-col gap-[6px]">
                                <h4 className="font-semibold text-[#030504]">Kode Pos</h4>
                                <div className="group relative flex h-[54px] items-center justify-center rounded-full bg-[#E0E0EC] transition-all duration-300 focus-within:bg-items-gradient-purple-pink">
                                    <input
                                        value={formData.post_code}
                                        onChange={handleChange}
                                        type="text"
                                        name="post_code"
                                        className="absolute h-[calc(100%_-_2px)] w-[calc(100%_-_2px)] rounded-full bg-[#F6F6F8] pl-[57px] pr-[13px] font-semibold text-[#030504] transition-all duration-300 placeholder:font-normal placeholder:leading-[24px] placeholder:text-[#ACACB9] focus:h-[calc(100%_-_4px)] focus:w-[calc(100%_-_4px)] focus:outline-none"
                                        placeholder="Masukkan Kode Pos"
                                    />
                                    <div className="absolute left-[14px] top-1/2 flex w-[35px] -translate-y-1/2 justify-between">
                                        <img
                                            src="/assets/images/icons/location.svg"
                                            alt="icon"
                                            className="size-[24px] shrink-0"
                                        />
                                        <span className="h-[26px] w-px bg-[#E0E0EC] transition-all duration-300 group-focus-within:bg-items-gradient-purple-pink" />
                                    </div>
                                </div>
                                {formErrors.find((error) => error.path.includes("post_code")) && (
                                    <p className="text-sm leading-[21px] text-[#E70011]">
                                        {formErrors.find((error) => error.path.includes("post_code"))?.message}
                                    </p>
                                )}
                            </label>
                        </div>
                    </section>
                    <button
                        type="submit"
                        className="mt-[10px] flex w-full items-center justify-between rounded-full bg-items-gradient-pink-white px-5 py-[14px] transition-all duration-300 hover:shadow-[0px_6px_22px_0px_#FF4D9E82]"
                    >
                        <strong className="font-semibold text-white">
                            Continue to Payment
                        </strong>
                        <img
                            src="/assets/images/icons/right.svg"
                            alt="icon"
                            className="size-[24px] shrink-0"
                        />
                    </button>
                </form>
            </div>
        </main>
    )
}