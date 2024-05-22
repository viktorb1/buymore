import type { ReturnedData } from "../types"

const fetchOfferupData = async (searchQuery: string, signal: AbortSignal) => {

    const query = `
    query GetModularFeed($searchParams: [SearchParam], $debug: Boolean = false) {
        modularFeed(params: $searchParams, debug: $debug) {
        analyticsData { requestId searchPerformedEventUniqueId searchSessionId __typename }
        categoryInfo { categoryId isForcedCategory __typename }
        feedAdditions
        filters { ...modularFilterNumericRange ...modularFilterSelectionList __typename }
        legacyFeedOptions { ...legacyFeedOptionListSelection ...legacyFeedOptionNumericRange __typename }
        looseTiles { ...modularTileBanner ...modularTileJob ...modularTileEmptyState ...modularTileListing ...modularTileSearchAlert __typename }
        modules { ...modularGridModule __typename }
        pageCursor
        query { ...modularQueryInfo __typename }
        requestTimeMetadata { resolverComputationTimeSeconds serviceRequestTimeSeconds totalResolverTimeSeconds __typename }
        searchAlert { alertId alertStatus __typename }
        debugInformation @include(if: $debug) {
            rankedListings { listingId attributes { key value __typename } __typename }
            lastViewedItems { listingId attributes { key value __typename } __typename }
            categoryAffinities { affinity count decay affinityOwner __typename }
            rankingStats { key value __typename }
            __typename
        }
        __typename
        }
    }
    
    fragment modularFilterNumericRange on ModularFeedNumericRangeFilter {
        isExpandedHighlight lowerBound { ...modularFilterNumericRangeBound __typename }
        shortcutLabel shortcutRank subTitle targetName title type
        upperBound { ...modularFilterNumericRangeBound __typename }
        __typename
    }
    
    fragment modularFilterNumericRangeBound on ModularFeedNumericRangeFilterNumericRangeBound {
        label limit placeholderText targetName value __typename
    }
    
    fragment modularFilterSelectionList on ModularFeedSelectionListFilter {
        targetName title subTitle shortcutLabel shortcutRank type isExpandedHighlight
        options { ...modularFilterSelectionListOption __typename } __typename
    }
    
    fragment modularFilterSelectionListOption on ModularFeedSelectionListFilterOption {
        isDefault isSelected label subLabel value __typename
    }
    
    fragment legacyFeedOptionListSelection on FeedOptionListSelection {
        label labelShort name position queryParam type
        options { default label labelShort selected subLabel value __typename }
        __typename
    }
    
    fragment legacyFeedOptionNumericRange on FeedOptionNumericRange {
        label labelShort leftQueryParam lowerBound name position rightQueryParam
        options { currentValue label textHint __typename } units upperBound __typename
    }
    
    fragment modularTileBanner on ModularFeedTileBanner { tileId tileType title __typename }
    
    fragment modularTileJob on ModularFeedTileJob {
        tileId tileType job {
        address { city state zipcode __typename }
        companyName datePosted image { height url width __typename }
        industry jobId jobListingUrl jobOwnerId pills { text type __typename }
        title apply { method value __typename } wageDisplayValue provider __typename
        }
        __typename
    }
    
    fragment modularTileEmptyState on ModularFeedTileEmptyState { tileId tileType title description iconType __typename }
    
    fragment modularTileListing on ModularFeedTileListing {
        tileId listing { ...modularListing __typename } tileType __typename
    }
    
    fragment modularListing on ModularFeedListing {
        listingId conditionText flags
        image { height url width __typename }
        isFirmPrice locationName price title vehicleMiles __typename
    }
    
    fragment modularTileSearchAlert on ModularFeedTileSearchAlert { tileId tileType title __typename }
    
    fragment modularGridModule on ModularFeedModuleGrid {
        moduleId collection formFactor
        grid { actionPath tiles { ...modularModuleTileListing __typename } __typename }
        moduleType rank rowIndex searchId subTitle title infoActionPath feedIndex __typename
    }
    
    fragment modularModuleTileListing on ModularFeedTileListing {
        ...modularTileListing moduleId moduleRank moduleType __typename
    }
    
    fragment modularQueryInfo on ModularFeedQueryInfo {
        appliedQuery decisionType originalQuery suggestedQuery __typename
    }  
    `;


    const searchParams = [
        { key: 'SORT', value: '-posted' },
        { key: 'DELIVERY_FLAGS', value: 'p' },
        { key: 'DISTANCE', value: '100' },
        { key: 'q', value: encodeURIComponent(searchQuery) },
        { key: 'platform', value: 'web' },
        { key: 'zipcode', value: '95608' },
        { key: 'experiment_id', value: 'experimentmodel24' },
        { key: 'limit', value: '100' }
    ];


    const payload = {
        query: query,
        variables: { searchParams: searchParams }
    };

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        Accept: 'application/json',
    };

    const looseTiles = await fetch('https://offerup.com/api/graphql', {
        method: 'POST',
        headers: {
            ...headers,
            'Content-Type': 'application/json'
        },
        signal,
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => data.data.modularFeed.looseTiles);

    console.log(looseTiles)
    const formattedData = looseTiles
    .map((item: {listing: object}, index: number) => {
        if (!item.listing) return null
        
        const listing: {title: string, price: string, listingId: string, image: {url: string}}  = item.listing as {title: string, price: string, listingId: string, image: {url: string}}
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);
        const startOfDayUTCSeconds = Math.floor(currentDate.getTime() / 1000);


        return {
            "type": "offerup",
            "name": listing.title,
            "price": parseInt(listing.price) * 100,
            "id": listing.listingId,
            "url": `https://offerup.com/item/detail/${listing.listingId}`,
            "thumbnail": listing.image.url,
            "created": startOfDayUTCSeconds - index*10,
            "color": "#00a87e"
        };
    })
    .filter((item:ReturnedData)  => item !== null);

    return formattedData;
}

export { fetchOfferupData}
