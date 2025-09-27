// Quick syntax fix for the corrupted MARKET_ANALYSIS
// Replace the corrupted section with this clean version

const CLEAN_MARKET_ANALYSIS = {
    sugarcane: { 
        msp: '₹3,400 / quintal', 
        currentPrice: '₹3,550 / quintal',
        trend: 'Upward (+4.2%)', 
        forecast: 'Very Positive', 
        recommendation: 'Hold & Sell in Feb 2026', 
        reason: 'Post-harvest demand from mills is expected to peak in February, potentially increasing prices by 5-8%. Sugar industry reports indicate strong export demand.',
        marketFactors: [
            'Export demand increased by 12% this quarter',
            'Government announced additional ethanol blending targets',
            'Reduced production in neighboring states due to drought',
            'Industrial sugar demand up 8% year-over-year'
        ],
        priceHistory: [3200, 3280, 3350, 3420, 3550],
        volatilityRisk: 'Low',
        liquidityScore: 9.2
    },
    cotton: { 
        msp: '₹7,020 / quintal', 
        currentPrice: '₹7,350 / quintal',
        trend: 'Upward (+6.8%)', 
        forecast: 'Excellent', 
        recommendation: 'Sell immediately post-harvest', 
        reason: 'Global export demand is currently very high. Textile industry recovery post-pandemic has created unprecedented demand. Prices are unlikely to be better later in the season.',
        marketFactors: [
            'Global cotton deficit of 2.1 million bales predicted',
            'China increasing imports by 25%',
            'Textile exports from India up 18%',
            'Weather concerns in major cotton-producing regions'
        ],
        priceHistory: [6800, 6950, 7100, 7250, 7350],
        volatilityRisk: 'Medium',
        liquidityScore: 8.7
    },
    wheat: { 
        msp: '₹2,275 / quintal', 
        currentPrice: '₹2,310 / quintal',
        trend: 'Stable (+1.5%)', 
        forecast: 'Neutral', 
        recommendation: 'Sell in staggered lots', 
        reason: 'Record production expected nationally. Government procurement will provide price support, but private market may see pressure. Selling in lots mitigates price risk.',
        marketFactors: [
            'Record harvest expected - 112 million tonnes',
            'Government procurement target: 44.4 million tonnes',
            'Export restrictions may be eased',
            'Storage capacity constraints in some regions'
        ],
        priceHistory: [2250, 2265, 2280, 2295, 2310],
        volatilityRisk: 'Low',
        liquidityScore: 9.5
    },
};

export default CLEAN_MARKET_ANALYSIS;
