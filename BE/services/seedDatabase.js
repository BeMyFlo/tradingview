import mongoose from "mongoose";
import Bars from "../model/bar.js";
import { cityModel } from "../model/city.js";
import { districtModel } from "../model/district.js";
import { tableModel } from "../model/table.js";
import { barModel } from "../model/bar.js";
import { userLikeModel } from "../model/user_like.js";
import District from "../model/district.js";
import Tables from "../model/table.js";
import UserLike from "../model/user_like.js";
import axios from "axios";

const barData = [
    { name: "Pura Billiard", address: '24 Bùi Đình Tuý, Phường 26, Quận Bình Thạnh, Hồ Chí Minh, Việt Nam', district_id: "Quận Bình Thạnh", city_id: "Hồ Chí Minh", content: "Quán bida chất lượng", amount_table_type_hole: 10, amount_table_type_carom: 10, imageUrl: "https://vatlieunoithat.com.vn/image/cache/catalog/library_image/2023-09-14-217-0-blog-image/1007953369_z4588092357591f92a6935672ae78e3ddcdd066472d77e-1000x750.jpg", owner:"672dba7b7d4749085d4ef304", rating: 3, price: 98000 },
    { name: "Kinh Tế Billiard", address: '262 Nguyễn Gia Trí, Phường 25, Quận Bình Thạnh, Hồ Chí Minh, Việt Nam', district_id: "Quận Bình Thạnh", city_id: "Hồ Chí Minh", content: "Quán bida chất lượng", amount_table_type_hole: 17, amount_table_type_carom: 3, imageUrl: "https://thethaodonga.com/wp-content/uploads/2021/10/cau-lac-bo-bida-ha-noi-2-768x425.jpg", owner:"672dba7b7d4749085d4ef304", rating: 3, price: 70000 },
    { name: "KingKong Billiard", address: '263 Nguyễn Văn Đậu, Phường 11, Quận Bình Thạnh, Hồ Chí Minh, Việt Nam', district_id: "Quận Bình Thạnh", city_id: "Hồ Chí Minh", content: "Quán bida chất lượng", amount_table_type_hole: 3, amount_table_type_carom: 17, imageUrl: "https://thethaodonga.com/wp-content/uploads/2021/10/cau-lac-bo-bida-ha-noi-21-768x510.jpg", owner:"672dba7b7d4749085d4ef304", rating: 3, price: 80000 },
];

const districtData = [
    { name: "Quận 1", cityName: "Hồ Chí Minh" },
    { name: "Quận 2", cityName: "Hồ Chí Minh" },
    { name: "Quận 3", cityName: "Hồ Chí Minh" },
    { name: "Quận 4", cityName: "Hồ Chí Minh" },
    { name: "Quận 5", cityName: "Hồ Chí Minh" },
    { name: "Quận 6", cityName: "Hồ Chí Minh" },
    { name: "Quận 7", cityName: "Hồ Chí Minh" },
    { name: "Quận 8", cityName: "Hồ Chí Minh" },
    { name: "Quận 9", cityName: "Hồ Chí Minh" },
    { name: "Quận 10", cityName: "Hồ Chí Minh" },
    { name: "Quận 11", cityName: "Hồ Chí Minh" },
    { name: "Quận 12", cityName: "Hồ Chí Minh" },
    { name: "Quận Bình Tân", cityName: "Hồ Chí Minh" },
    { name: "Quận Bình Thạnh", cityName: "Hồ Chí Minh" },
    { name: "Quận Gò Vấp", cityName: "Hồ Chí Minh" },
    { name: "Quận Phú Nhuận", cityName: "Hồ Chí Minh" },
    { name: "Quận Tân Bình", cityName: "Hồ Chí Minh" },
    { name: "Quận Tân Phú", cityName: "Hồ Chí Minh" },
    { name: "Quận Thủ Đức", cityName: "Hồ Chí Minh" },
];

const cityData = [
    { name: "Hà Nội" },
    { name: "Hồ Chí Minh" }
];

const seedDatabase = async () => {
    try {
        await cityModel.deleteMany({});
        await districtModel.deleteMany({});

        const insertedCities = await cityModel.insertMany(cityData);

        const districtsWithCityId = districtData.map(district => {
            const city = insertedCities.find(city => city.name === district.cityName);
            return {
                name: district.name,
                city_id: city ? city._id : null
            };
        });

        for (const district of districtsWithCityId){
            try {
                await axios.post('http://localhost:8000/api/district/create', district);
            } catch (error) {
                console.log(error);
                console.error(`Failed to create bar: ${district.name}`, error.response?.data || error.message);
            }
        } 

        await barModel.deleteMany({});
        tableModel.deleteMany({});
        const BarData = [];
        for (const bar of barData) {
            const city = insertedCities.find(city => city.name === bar.city_id);
            const district = await District.findOne({ name: bar.district_id });
            BarData.push({
                ...bar,
                city_id: city ? city._id : null,
                district_id: district ? district._id : null
            });
        }

        for (const bar of BarData) {
            try {
                await axios.post('http://localhost:8000/api/bar/create', bar);
            } catch (error) {
                console.log(error);
            }
        }

        await userLikeModel.deleteMany({});

        console.log("Data seeding completed");
    } catch (error) {
        console.error("Error seeding database:", error);
    }
};

export default seedDatabase;