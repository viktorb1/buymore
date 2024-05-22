// import { useEffect, useState } from "react";
import ListingsComponent from "./components/ListingsComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useState } from "react";
import { getChromeStorage, setChromeStorage } from "../scripts/chromeStorage";

function App() {
  const [newSearchQuery, setNewSearchQuery] = useState("");
  const [queries, setQueries] = useState<{ query: string }[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setQueries(((await getChromeStorage("queries")) as any[]) || []);
      setItemCounts(((await getChromeStorage("item_counts")) || {}) as Record<string, number>);
    })();
  }, []);

  useEffect(() => {
    const total = Math.min(
      Object.values(itemCounts).reduce((acc, value) => acc + value, 0),
      999
    );
    console.log("updating item counts to", total, itemCounts);

    chrome.action.setBadgeText({ text: total.toString() == "0" ? "" : total.toString() });
    chrome.action.setBadgeBackgroundColor({ color: "#962821" });
  }, [itemCounts]);

  const saveSearchQuery = async (e: any) => {
    e.preventDefault();
    if (!newSearchQuery.length) return;

    const currentQueries = ((await getChromeStorage("queries")) as any[]) || [];
    currentQueries.push({ query: newSearchQuery });

    setQueries((prevQueries) => [...prevQueries, { query: newSearchQuery }]);
    await setChromeStorage("queries", currentQueries);
    setNewSearchQuery(() => "");
    setActiveIndex(() => currentQueries.length - 1);
  };

  const removeQuery = async (queryToDelete: string) => {
    setIsLoading(true);
    const currentQueries = ((await getChromeStorage("queries")) as any[]) || [];
    const newQueries = currentQueries.filter((query: any) => query.query != queryToDelete);
    setQueries(newQueries);
    await setChromeStorage("queries", newQueries);

    // remove item count
    const newItemCounts = ((await getChromeStorage("item_counts")) || {}) as Record<string, number>;
    delete newItemCounts[queryToDelete];
    setItemCounts(newItemCounts);
    await setChromeStorage("item_counts", newItemCounts);
    // remove last viewed index
    await chrome.storage.local.remove(`${queryToDelete.replace(" ", "_")}_last_seen`);
    setIsLoading(false);
    console.log("should be", newItemCounts, queryToDelete);
    if (activeIndex >= newQueries.length) setActiveIndex(newQueries.length - 1);
  };

  const trackLoadingHook = useCallback(async (loading: boolean) => {
    setIsLoading(loading);
    console.log("loading state is", loading);
    if (!loading) {
      setItemCounts(((await getChromeStorage("item_counts")) || {}) as Record<string, number>);
    }
  }, []);

  return (
    <>
      <div>
        <div className="flex flex-row">
          <div className="flex flex-col mt-28 ml-8 mr-6 min-w-[250px]">
            {queries &&
              queries.map((query: any, index: number) => (
                <div key={query.query} className="flex w-full mb-4 space between">
                  <div></div>
                  <button className="mr-2 border-none btn btn-secondary" onClick={() => removeQuery(query.query)}>
                    <FontAwesomeIcon icon={faXmark} className="text-xl" />
                  </button>
                  <div
                    className={`flex-grow btn ${activeIndex == index ? "btn-warning" : ""}`}
                    onClick={() => {
                      setActiveIndex(-1);
                      setTimeout(() => setActiveIndex(index), 0);
                    }}
                  >
                    {query.query}
                    {itemCounts[query.query] > 0 && (activeIndex != index || (activeIndex == index && !isLoading)) && (
                      <div className="badge">{itemCounts[query.query]}</div>
                    )}
                  </div>
                </div>
              ))}

            <form className="flex w-full" onSubmit={saveSearchQuery}>
              <input
                type="text"
                placeholder="new search term"
                className="z-10 flex-grow w-full mb-4 rounded-r-none input input-bordered"
                value={newSearchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSearchQuery(e.target.value)}
              />
              <button className="rounded-l-none btn btn-info" type="submit">
                <FontAwesomeIcon icon={faFloppyDisk} />
                SAVE
              </button>
            </form>
          </div>
          <ListingsComponent
            query={queries[activeIndex]}
            activeIndex={activeIndex}
            trackLoadingHook={trackLoadingHook}
          />
        </div>
      </div>
    </>
  );
}

export default App;
