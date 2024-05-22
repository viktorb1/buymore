import * as cheerio from 'cheerio';
import type { ReturnedData } from '../types';

// function hexEncodeUrl(url: string) {

//     let hexEncodedUrl = '';
    
//     for (let i = 0; i < url.length; i++) {
//       hexEncodedUrl += '%' + url.charCodeAt(i).toString(16).toUpperCase();
//     }
    
//     return hexEncodedUrl;
//   }

const generateUTCFromDate = (dateString: string) => {
    const currentYear = new Date().getFullYear();
    dateString = dateString.split(' ').join(` ${currentYear.toString()} `);

    // Create a Date object from the dateString
    const date = new Date(dateString);

    // Check if the date is in the future
    const now = new Date();
    if (date > now) {
        // Subtract one year if the date is in the future
        date.setFullYear(date.getFullYear() - 1);
    }

    // Get the UTC timestamp in milliseconds
    const utcMilliseconds = date.getTime();

    // Convert milliseconds to seconds
    const utcSeconds = Math.floor(utcMilliseconds / 1000);
    return utcSeconds;
}

  
  

const fetchEbayData = async (searchQuery: string, signal: AbortSignal): Promise<ReturnedData[]> => {
    const ebaySearchUrl = `https://www.ebay.com/sch/i.html?_from=R40&_nkw=${searchQuery}&_sacat=0&_sop=10&rt=nc&LH_BIN=1`

    const response = await fetch(ebaySearchUrl, {
        method: 'GET',
        signal
    })
    const html = await response.text()
    console.log(html)

    const $ = cheerio.load(html);
    const results: ReturnedData[] = [];

    $('.s-item').each((_, element) => {
        if (!$(element).attr('data-viewport')) return
        let name = $(element).find('.s-item__title span').text().trim();
        const priceText = $(element).find('.s-item__price').text().trim();
        const price = Math.round(parseFloat(priceText.replace(/[^0-9.-]+/g, "")) * 100);
        
        const thumbnail = $(element).find('.s-item__image-wrapper img').attr('src')!.replace(/-l\d+\.jpg$/, '-l300.jpg') || '';
        const url = $(element).find('.s-item__link').attr('href')!.split('?')[0];
        const id = url.split('/')[url.split('/').length-1]
        const createdText = $(element).find('.s-item__listingDate .BOLD').text().trim();
        const created = generateUTCFromDate(createdText)
        const color = '#F5AF02';
        const type = "ebay";

        if (name.toUpperCase().endsWith('NEW LISTING')) name = name.slice(0, name.length - 11)
        if (name.toUpperCase().startsWith('NEW LISTING')) name = name.slice(11)
        results.push({
            type,
            name,
            price,
            id,
            thumbnail,
            url,
            created,
            color,
        });
    });

    console.log(results.slice(1))
    return results.slice(1);
    
}



export {
    fetchEbayData
}