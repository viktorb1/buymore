interface MercariReturnedData {name: string, price: number, id: string, photos: Array<{thumbnail: string, imageUrl: string}>}

interface ReturnedData {name: string, price: number, id: string, thumbnail: string, url: string, created: number, color: string, type: "mercari" | "craigslist" | "offerup" | "goodwill" | "ebay"}


export type {MercariReturnedData, ReturnedData}