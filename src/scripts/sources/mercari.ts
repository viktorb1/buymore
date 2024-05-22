
import type { MercariReturnedData } from "../types"

const getAccessToken = async (url: string, signal: AbortSignal): Promise<string> => {
    const headers = {
        // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Accept': 'application/json',
        // Include other headers here if necessary
    };

    try {
        const response = await fetch(url, { headers, signal });

        if (response.ok) { // Check if the response status is in the range 200-299
            const data = await response.json();
            return data.accessToken;
        } else {
            throw new Error(`Failed to fetch access token: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        // Handle network errors, parsing errors, etc.
        throw new Error(`An error occurred while fetching the access token: ${error}`);
    }
};


const fetchDataWithToken = async (apiUrl: string, token: string, signal: AbortSignal): Promise<any> => {
    const headers = {
        // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers,
            signal
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data)
            return data;
        } else {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        throw new Error(`An error occurred while fetching data: ${error}`);
    }
};


const fetchMercariData = async (searchQuery: string, signal: AbortSignal) => {
    const mercariAuthUrl = "https://www.mercari.com/v1/authorize";
    const mercariSearchUrl = `https://www.mercari.com/v1/api?operationName=searchFacetQuery&variables=%7B%22criteria%22%3A%7B%22offset%22%3A0%2C%22soldItemsOffset%22%3A0%2C%22promotedItemsOffset%22%3A0%2C%22sortBy%22%3A2%2C%22length%22%3A100%2C%22query%22%3A%22${encodeURIComponent(searchQuery)}%22%2C%22itemConditions%22%3A%5B5%2C4%2C3%2C2%2C1%5D%2C%22shippingPayerIds%22%3A%5B%5D%2C%22sizeGroupIds%22%3A%5B%5D%2C%22sizeIds%22%3A%5B%5D%2C%22itemStatuses%22%3A%5B%5D%2C%22customFacets%22%3A%5B%5D%2C%22facets%22%3A%5B1%2C2%2C3%2C5%2C7%2C8%2C9%2C10%2C11%2C13%2C16%2C19%5D%2C%22authenticities%22%3A%5B%5D%2C%22deliveryType%22%3A%22all%22%2C%22state%22%3Anull%2C%22locale%22%3Anull%2C%22shopPageUri%22%3Anull%2C%22withCouponOnly%22%3Anull%2C%22countrySources%22%3A%5B%5D%2C%22showDescription%22%3Afalse%7D%2C%22categoryId%22%3A0%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%222fd981e6c4573c3b9a63aedfc106c09f27f6800fa7117920f1f04a42c1f2a7f9%22%7D%7D`;

    const token = await getAccessToken(mercariAuthUrl, signal);
    const data = await fetchDataWithToken(mercariSearchUrl, token, signal);
    const itemsList = data.data.search.itemsList.filter((item: any) => item.status !== "sold_out");
    // console.log(itemsList)
    const formattedData = itemsList.map((item: MercariReturnedData) => ({
      "type": "mercari",
      "name": item.name,
      "price": item.price,
      "id": item.id,
      "url": `https://www.mercari.com/us/item/${item['id']}`,
      "thumbnail": item.photos[0].thumbnail,
      "created": parseInt(item.photos[0].imageUrl.split('?').pop()!),
      "color": "#5356ee"
    }))

    return formattedData
}

export {
    fetchMercariData
}


