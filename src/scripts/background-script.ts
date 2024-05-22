import { fetchMercariData } from "./sources/mercari";
import { fetchGoodwillData } from "./sources/goodwill"
import { fetchOfferupData } from "./sources/offerup";
import { fetchCraigslistData} from "./sources/craigslist"
import type { ReturnedData } from "./types"
import { fetchEbayData } from "./sources/ebay";
import { getChromeStorage, setChromeStorage } from "./chromeStorage";
import { removeSeenItems } from "./trimmer";


let controller: AbortController;


chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.action === "fetchData" && (request.query && request.query.length > 0)) {

    if (controller) {
      console.log("request aborted")
      controller.abort();
    }

    controller = new AbortController();
    const signal = controller.signal;



    (async () => {
      try {
        const craigslistData = await fetchCraigslistData(request.query, signal);
        const mercariData = await fetchMercariData(request.query, signal);
        const goodwillData = await fetchGoodwillData(request.query, signal);
        const offerupData = await fetchOfferupData(request.query, signal);
        const ebayData = await fetchEbayData(request.query, signal);

        sendResponse({
          "craigslist": craigslistData,
          "mercari": mercariData,
          "goodwill": goodwillData,
          "offerup": offerupData,
          "ebay": ebayData
        });
        return true
      } catch (error: unknown) {
          console.error(error)
          sendResponse({ "aborted": true });
          return true
      }
    })();

  }

  return true;
});

chrome.runtime.onInstalled.addListener(async () => {
  await fetchDataAndUpdateBadge()
  chrome.alarms.create('fetchDataEveryHour', { periodInMinutes: 60 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'fetchDataEveryHour') {
    fetchDataAndUpdateBadge();
  }
});


async function fetchDataAndUpdateBadge() {
  // console.log("here you go:::")
  // console.log(await getChromeStorage('item_counts'))
  const queries = (await getChromeStorage('queries') || []) as {query: string}[]
  let total_count = 0

  const item_counts = {} as Record<string, number>

  if (controller) {
    controller.abort();
  }

  controller = new AbortController();
  const signal = controller.signal;


  const counts = queries.map(async (request) => {

    const craigslistData: ReturnedData[] = await fetchCraigslistData(request.query, signal);
    const mercariData: ReturnedData[] = await fetchMercariData(request.query, signal);
    const goodwillData: ReturnedData[] = await fetchGoodwillData(request.query, signal);
    const offerupData: ReturnedData[] = await fetchOfferupData(request.query, signal);
    const ebayData: ReturnedData[] = await fetchEbayData(request.query, signal);

    const data = {
      "craigslist": craigslistData,
      "mercari": mercariData,
      "goodwill": goodwillData,
      "offerup": offerupData,
      "ebay": ebayData,
    }
    console.log("data", data)

    const trimmedData: ReturnedData[] = await removeSeenItems(data, request)
    try {
      item_counts[request.query] = trimmedData.length
    } catch (e) {
      console.log("it failed", e)
      console.log(trimmedData)
    }

    return trimmedData.length
  })

  for (const num of counts) {
    total_count += (await num)
  }

  await setChromeStorage("item_counts", item_counts)
  // console.log(counts)
  total_count = Math.min(total_count, 999)

  // console.log("updating value to", Math.min(total_count, 999))
  chrome.action.setBadgeText({ text: total_count.toString() == '0' ? '': total_count.toString() });
  chrome.action.setBadgeBackgroundColor({ color: '#962821' });

}

chrome.action.onClicked.addListener(() => {
  console.log("running")
  chrome.tabs.create({ url: "src/web/settings.html" });
});