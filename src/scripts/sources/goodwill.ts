const goodwillSearchUrl: string = "https://buyerapi.shopgoodwill.com/api/Search/ItemListing";

import type { ReturnedData } from "../types"


const fetchGoodwillData = async (searchQuery: string, signal: AbortSignal) => {
    const goodwillSearch = {
        isSize: false,
        lowPrice: "0",
        highPrice: "999999",
        searchBuyNowOnly: "",
        sortDescending: true,
        searchText: searchQuery,
        selectedSellerIds: "162"
    };

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    let data;

    try {
        data = await fetch(goodwillSearchUrl, {
            method: 'POST',
            headers: headers,
            signal,
            body: JSON.stringify(goodwillSearch)
        })
        .then(response => response.json()).then(items => {
            console.log(items);
            return items.searchResults.items
        })
    } catch(e) {
        data = []
    }


    const items: ReturnedData[] = data.map((item: {title: string, currentPrice: string, imageURL: string, startTime: string, itemId: string}) => ({
        "type": "goodwill",
        "name": item.title, 
        "price": Math.trunc(parseFloat(item.currentPrice) * 100),
        "id": item.itemId,
        "thumbnail": item.imageURL,
        "url": `https://www.shopgoodwill.com/item/${item.itemId}`,
        "created": new Date(item.startTime).getTime() / 1000,
        "color": "#3d72a3"
    }))

    // console.log(items)

    return items
}

export { fetchGoodwillData }