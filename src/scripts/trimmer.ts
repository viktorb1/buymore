import { getChromeStorage } from "./chromeStorage";
import { ReturnedData } from "./types";

const removeSeenItems = async (data: any, query: {query: string}) => {
    const seenState = await getChromeStorage(`${query.query.replace(" ", "_")}_last_seen`) ||
          {
            offerup: null,
            mercari: null,
            craigslist: null,
            goodwill: null,
            ebay: null,
          } as any
  
      let offerup_trim_index = seenState.offerup
        ? data.offerup.findIndex((item: ReturnedData) => item.id === seenState.offerup.id)
        : data.offerup.length;
  
      let mercari_trim_index = seenState.mercari
        ? data.mercari.findIndex((item: ReturnedData) => item.id === seenState.mercari.id)
        : data.mercari.length;
  
      let craigslist_trim_index = seenState.craigslist
        ? data.craigslist.findIndex((item: ReturnedData) => item.id === seenState.craigslist.id)
        : data.craigslist.length;
  
      let goodwill_trim_index = seenState.goodwill
        ? data.goodwill.findIndex((item: ReturnedData) => item.id === seenState.goodwill.id)
        : data.goodwill.length;
  
      let ebay_trim_index = seenState.ebay
        ? data.ebay.findIndex((item: ReturnedData) => item.id === seenState.ebay.id)
        : data.ebay.length;
  
      if (offerup_trim_index === -1) offerup_trim_index = data.offerup.length;
      if (mercari_trim_index === -1) mercari_trim_index = data.mercari.length;
      if (craigslist_trim_index === -1) craigslist_trim_index = data.craigslist.length;
      if (goodwill_trim_index === -1) goodwill_trim_index = data.goodwill.length;
      if (ebay_trim_index === -1) ebay_trim_index = data.ebay.length;
  
      return data.offerup
        .slice(0, offerup_trim_index)
        .concat(
          data.mercari.slice(0, mercari_trim_index),
          data.craigslist.slice(0, craigslist_trim_index),
          data.goodwill.slice(0, goodwill_trim_index),
          data.ebay.slice(0, ebay_trim_index)
        )
        .sort((a: ReturnedData, b: ReturnedData) => b.created - a.created);
}

export {removeSeenItems}