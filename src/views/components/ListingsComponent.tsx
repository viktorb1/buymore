import { useEffect, useState, memo } from "react";
import type { ReturnedData } from "../../scripts/types";
// import { defaultData } from "../dummyData";
import craigslist from "@/assets/craigslist.png";
import goodwill from "@/assets/goodwill.png";
import mercari from "@/assets/mercari.png";
import offerup from "@/assets/offerup.png";
import ebay from "@/assets/ebay.png";
import { getChromeStorage, setChromeStorage } from "../../scripts/chromeStorage";
import { removeSeenItems } from "../../scripts/trimmer";

const ListingsComponent = memo(
  ({
    query,
    activeIndex,
    trackLoadingHook,
  }: {
    query: { query: string };
    activeIndex: number;
    trackLoadingHook: (loading: boolean) => Promise<void>;
  }) => {
    // const [data, setData] = useState<ReturnedData[]>(defaultData);
    // const [filteredData, setFilteredData] = useState<ReturnedData[]>(defaultData);
    const [data, setData] = useState<ReturnedData[]>([]);
    const [filteredData, setFilteredData] = useState<ReturnedData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [active, setActive] = useState({
      mercari: true,
      craigslist: true,
      offerup: true,
      goodwill: true,
      ebay: true,
    });

    const fetchDataAndRemoveSeen = async () => {
      setIsLoading(() => true);
      let data = await chrome.runtime.sendMessage({ action: "fetchData", query: query.query });

      if (data.aborted) return;
      data = await removeSeenItems(data, query);

      const itemCounts = ((await getChromeStorage("item_counts")) || {}) as Record<string, number>;
      itemCounts[query.query] = data.length;
      await setChromeStorage("item_counts", itemCounts);

      setFilteredData(() => data);
      setData(() => data);
      setIsLoading(() => false);
    };

    useEffect(() => {
      (async () => {
        if (query && query.query) {
          console.log("yes we running...", isLoading);
          await trackLoadingHook(isLoading);
        }
      })();
    }, [isLoading, trackLoadingHook, query]);

    useEffect(() => {
      if (query && query.query) {
        (async () => {
          console.log("we are fetching", query.query, activeIndex);
          await fetchDataAndRemoveSeen();
        })();
      } else {
        setIsLoading(() => false);
      }
    }, [query]);

    useEffect(() => {
      setFilteredData(
        data.filter((item) => {
          return active[item.type];
        })
      );
    }, [active, data]);

    const saveLastReadState = async () => {
      setIsLoading(() => true);
      const seenState =
        (await getChromeStorage(`${query.query.replace(" ", "_")}_last_seen`)) ||
        ({
          offerup: null,
          mercari: null,
          craigslist: null,
          goodwill: null,
          ebay: null,
        } as any);

      const first_offerup = filteredData.find((item) => item.type === "offerup");
      const first_mercari = filteredData.find((item) => item.type === "mercari");
      const first_craigslist = filteredData.find((item) => item.type === "craigslist");
      const first_goodwill = filteredData.find((item) => item.type === "goodwill");
      const first_ebay = filteredData.find((item) => item.type === "ebay");

      if (first_offerup) seenState.offerup = first_offerup;
      if (first_mercari) seenState.mercari = first_mercari;
      if (first_craigslist) seenState.craigslist = first_craigslist;
      if (first_goodwill) seenState.goodwill = first_goodwill;
      if (first_ebay) seenState.ebay = first_ebay;

      await setChromeStorage(`${query.query.replace(" ", "_")}_last_seen`, seenState);

      const item_counts = ((await getChromeStorage("item_counts")) || {}) as Record<string, number>;
      item_counts[query.query] -= filteredData.length;
      await setChromeStorage("item_counts", item_counts);

      setData((data) => data.filter((el) => !filteredData.includes(el)));
      setFilteredData(() => []);
      setIsLoading(() => false);
    };

    return (
      <div className="w-full">
        <div className="flex justify-between mx-12 mt-8 mb-4">
          <div></div>
          <button className="btn btn-active" onClick={saveLastReadState}>
            Mark all as seen
          </button>

          <div className="join">
            <button
              className={`relative border-none btn btn-[#181823] join-item` + (active.craigslist ? " btn-warning" : "")}
              onClick={async () => {
                await setActive((prevActive) => ({ ...prevActive, craigslist: !prevActive.craigslist }));
              }}
            >
              <img className="w-6 h-6" src={craigslist}></img>
            </button>
            <button
              className={`relative border-none btn btn-[#181823] join-item` + (active.ebay ? " btn-warning" : "")}
              onClick={async () => {
                await setActive((prevActive) => ({ ...prevActive, ebay: !prevActive.ebay }));
              }}
            >
              <img className="w-6" src={ebay}></img>
            </button>
            <button
              className={`relative border-none btn btn-[#181823] join-item` + (active.goodwill ? " btn-warning" : "")}
              onClick={async () => {
                await setActive((prevActive) => ({ ...prevActive, goodwill: !prevActive.goodwill }));
              }}
            >
              <img className="w-6" src={goodwill}></img>
            </button>
            <button
              className={`relative border-none btn btn-[#181823] join-item` + (active.mercari ? " btn-warning" : "")}
              onClick={async () => {
                await setActive((prevActive) => ({ ...prevActive, mercari: !prevActive.mercari }));
              }}
            >
              <img className="w-6" src={mercari}></img>
            </button>
            <button
              className={`relative border-none btn btn-[#181823] join-item` + (active.offerup ? " btn-warning" : "")}
              onClick={async () => {
                await setActive((prevActive) => ({ ...prevActive, offerup: !prevActive.offerup }));
              }}
            >
              <img className="w-6" src={offerup}></img>
            </button>
          </div>
        </div>
        <div className="flex flex-wrap">
          {!isLoading && (filteredData.length == 0 || activeIndex === -1) && (
            <div className="flex justify-center w-full h-[90vh] items-center">
              <h1 className="flex items-center justify-center text-4xl">No items</h1>
            </div>
          )}
          {!isLoading &&
            filteredData.length > 0 &&
            filteredData.map((item) => (
              <div
                key={item.id}
                className={`m-4 border-4 border-solid select-none rounded-2xl btn h-[300px] ${
                  !item.thumbnail ? "h-[100px]" : ""
                }`}
                style={{ backgroundColor: item.color, borderColor: item.color }}
              >
                <a href={item.url} target="_blank">
                  <p className="text-white rounded-t-xl w-[200px] h-[60px] overflow-scroll p-2">{item.name}</p>
                  <div className={`h-[200px] w-[200px] relative ${!item.thumbnail ? "h-[30px]" : ""}`}>
                    <p className="absolute bottom-0 right-0 z-10 p-1 m-2 font-bold text-black bg-white rounded-lg">
                      {"$" + (item.price / 100.0).toFixed(2)}
                    </p>

                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        className="object-cover w-full h-full pointer-events-none rounded-b-xl"
                        alt="product image"
                      />
                    )}
                  </div>
                </a>
              </div>
            ))}
          {isLoading && (
            <div className="flex justify-center w-full h-[90vh] items-center">
              <span className="flex items-center justify-center w-12 loading loading-dots"></span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default ListingsComponent;
