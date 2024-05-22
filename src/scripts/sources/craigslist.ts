import type { ReturnedData } from "../types"

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    'Accept': 'application/json',
    
}

async function fetchCraigslistPosts(url: string, signal: AbortSignal): Promise<any> {
    const response = await fetch(url, {
        method: "GET",
        headers: headers,
        signal
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}



const fetchCraigslistData = async (searchQuery: string, signal: AbortSignal): Promise<ReturnedData[]> => {
    const craigslistUrl = `https://sapi.craigslist.org/web/v8/postings/search?batch=12-0-360-1-0&cc=US&lang=en&postal=95608&query=${encodeURIComponent(searchQuery)}&searchPath=sss&search_distance=100&sort=date&srchType=T&area_id=12`;

    try {
        const data = await fetchCraigslistPosts(craigslistUrl, signal);
        console.log(data);  // Check the raw data structure here
        const items = data["data"]["items"];

        return items.map((item: any) => ({
            type: "craigslist",
            name: item.title,
            price: (item.price ? item.price * 100: 0).toString(),
            id: item.postingId.toString(),
            thumbnail: item.images && item.images.length > 0 ? `https://images.craigslist.org/${item.images[0].substring(2)}_600x450.jpg` : "",
            url: `https://${item.location.hostname}.craigslist.org/${item.categoryAbbr}/d/${item.seo}/${item.postingId}.html`,
            created: item.postedDate,
            color: "#ccc" // Assuming color data is not available
        })) as ReturnedData[];
    } catch (error) {
        console.error("Error fetching Craigslist posts:", error);
        throw error; // or handle more gracefully depending on your app's design
    }
}

export { fetchCraigslistData }