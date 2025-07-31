import json
import pickle
import nltk
import random
from nltk.stem import PorterStemmer
import requests
from prettytable import PrettyTable
import difflib
import os


def suggest_similar_symbols(symbol):
    matches = difflib.get_close_matches(symbol, COIN_ID_MAP.keys(), n=3, cutoff=0.6)
    if matches:
        return f"❌ Coin not found. Did you mean: {', '.join(matches)}?"
    return "❌ Coin not found. Try another name or symbol (e.g., 'btc', 'eth', 'sol')."


def get_top_gainers(limit=5):
    try:
        url = "https://api.coingecko.com/api/v3/coins/markets"
        params = {
            "vs_currency": "usd",
            "order": "price_change_percentage_24h_desc",
            "per_page": limit,
            "page": 1
        }
        res = requests.get(url, params=params)
        coins = res.json()

        # Return structured data
        data = []
        for coin in coins:
            data.append({
                "name": coin["name"],
                "price": coin["current_price"],
                "change": coin["price_change_percentage_24h"]
            })

        return {"type": "table", "title": f"📈 Top {limit} Gainers", "data": data}

    except:
        return {"type": "text", "reply": "❌ Could not fetch top gainers."}
    # try:
    #     url = "https://api.coingecko.com/api/v3/coins/markets"
    #     params = {
    #         "vs_currency": "usd",
    #         "order": "price_change_percentage_24h_desc",
    #         "per_page": limit,
    #         "page": 1
    #     }
    #     res = requests.get(url, params=params)
    #     coins = res.json()

    #     table = PrettyTable()
    #     table.field_names = ["Name", "Price", "% Change"]

    #     for coin in coins:
    #         name = coin["name"]
    #         price = f"${coin['current_price']:,}"
    #         change = f"{coin['price_change_percentage_24h']:.2f}%"
    #         table.add_row([name, price, change])

    #     return f"📈 Top {limit} Gainers in the Last 24h:\n```\n{table}\n```"
    # except:
    #     return "❌ Could not fetch top gainers right now. Please try again later."


# def load_coin_id_map():
#     try:
#         url = "https://api.coingecko.com/api/v3/coins/list"
#         res = requests.get(url)
#         coins = res.json()
#         symbol_map = {}
#         for coin in coins:
#             symbol_map[coin["symbol"].lower()] = coin["id"]
#         return symbol_map
#     except:
#         return {}

def load_coin_id_map():
    cache_file = "coin_list_cache.json"
    if os.path.exists(cache_file):
        with open(cache_file, "r", encoding="utf-8") as f:
            coins = json.load(f)
    else:
        url = "https://api.coingecko.com/api/v3/coins/list"
        res = requests.get(url)
        coins = res.json()
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(coins, f)

    symbol_map = {}
    for coin in coins:
        symbol_map[coin["symbol"].lower()] = coin["id"]
    return symbol_map

def compare_two_coins(text):
    try:
        words = text.lower().replace("price of", "").replace("vs", "|").split("|")
        if len(words) != 2:
            return "❌ Please use the format like: 'btc vs eth' or 'compare sol vs near'"

        coin1 = words[0].strip()
        coin2 = words[1].strip()

        for coin in [coin1, coin2]:
            if coin in POPULAR_SYMBOLS:
                continue
            elif coin not in COIN_ID_MAP:
                return suggest_similar_symbols(coin)

        id1 = POPULAR_SYMBOLS.get(coin1, COIN_ID_MAP.get(coin1))
        id2 = POPULAR_SYMBOLS.get(coin2, COIN_ID_MAP.get(coin2))

        url = f"https://api.coingecko.com/api/v3/simple/price?ids={id1},{id2}&vs_currencies=usd"
        res = requests.get(url).json()

        p1 = res.get(id1, {}).get("usd")
        p2 = res.get(id2, {}).get("usd")

        if p1 and p2:
            return (f"💱 Price Comparison:\n"
                    f"{coin1.upper()}: ${p1:,}\n"
                    f"{coin2.upper()}: ${p2:,}")
        else:
            return "⚠️ Could not fetch one or both prices."
    except:
        return "⚠️ Something went wrong during comparison."



POPULAR_SYMBOLS = {
    "btc": "bitcoin",
    "eth": "ethereum",
    "sol": "solana",
    "bnb": "binancecoin",
    "matic": "polygon",
    "near": "near",
    "ada": "cardano",
    "dot": "polkadot",
    "ltc": "litecoin",
    "shib": "shiba-inu",
    "doge": "dogecoin",
    "xrp": "ripple",
    # "aitech": "aitech"
}

COIN_ID_MAP = load_coin_id_map()

def get_crypto_price(coin_name):
     
    try:
        coin = coin_name.lower().replace(" ", "-")


        if coin in POPULAR_SYMBOLS:
            coin = POPULAR_SYMBOLS[coin]
        elif coin in COIN_ID_MAP:
            coin = COIN_ID_MAP[coin]

        url = f"https://api.coingecko.com/api/v3/simple/price?ids={coin}&vs_currencies=usd"
        res = requests.get(url)
        data = res.json()

        if coin in data:
            price = data[coin]["usd"]
            return f"💰 The current price of {coin.replace('-', ' ').title()} is ${price:,} USD."
        else:
            return suggest_similar_symbols(coin_name.lower())

    except:
        return "⚠️ Something went wrong while fetching the price. Try again."

def get_top_ecosystem_coins(category):
    try:
        url = f"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category={category}&order=market_cap_desc&per_page=5&page=1"
        res = requests.get(url)
        coins = res.json()

        if not coins:
            return {"type": "text", "reply": "⚠️ No coins found for that ecosystem. Try Ethereum or Solana."}

        data = []
        for coin in coins:
            data.append({
                "name": coin["name"],
                "price": coin["current_price"],
                "mcap": coin["market_cap"]
            })

        title = f"🌐 Top Coins in the {category.replace('-', ' ').title()} Ecosystem"
        return {"type": "table", "title": title, "data": data}

    except:
        return {"type": "text", "reply": "❌ Could not fetch data for that ecosystem. Try again later."}
    # try:
    #     url = f"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category={category}&order=market_cap_desc&per_page=5&page=1"
    #     res = requests.get(url)
    #     coins = res.json()

    #     if not coins:
    #         return "⚠️ No coins found for that ecosystem. Try Ethereum or Solana."

    #     table = PrettyTable()
    #     table.field_names = ["Name", "Price (USD)", "Market Cap"]

    #     for coin in coins:
    #         name = coin["name"]
    #         price = f"${coin['current_price']:,}"
    #         mcap = f"${coin['market_cap'] // 1_000_000}M"
    #         table.add_row([name, price, mcap])

    #     title = category.replace("-", " ").title()
    #     return f"🌐 Top Coins in the {title} Ecosystem:\n```\n{table}\n```"

    # except:
    #     return "❌ Could not fetch data for that ecosystem. Try again later."


stemmer = PorterStemmer()

with open("intents.json") as file:
    intents = json.load(file)

model = pickle.load(open("model.pkl", "rb"))
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))

def clean_text(text):
    tokens = text.lower().split()
    stemmed = " ".join([stemmer.stem(w) for w in tokens])
    return stemmed

def get_response(user_input):
    cleaned = clean_text(user_input)
    X = vectorizer.transform([cleaned])
    prediction = model.predict(X)[0]

    eco_keywords = {
    "ethereum": "ethereum-ecosystem",
    "solana": "solana-ecosystem",
    "near": "near-protocol-ecosystem",
    "avalanche": "avalanche-ecosystem",
    "bnb": "binance-smart-chain",
    "polygon": "polygon-ecosystem"
    }

    for name, category in eco_keywords.items():
        if name in user_input.lower() and any(word in user_input.lower() for word in ["ecosystem", "tokens", "coins", "top projects"]):
            return get_top_ecosystem_coins(category)

    if "price" in user_input.lower():
        for keyword in ["price of", "price for", "value of"]:
            if keyword in user_input.lower():
                coin = user_input.lower().split(keyword)[-1].strip()
                return get_crypto_price(coin)

    # if "top ethereum coins" in user_input.lower() or "ethereum ecosystem" in user_input.lower():
    #     return get_top_ethereum_ecosystem_coins()
    
    if " vs " in user_input.lower():
        return compare_two_coins(user_input)
    
    if any(kw in user_input.lower() for kw in ["top gainers", "biggest gainers", "price increase", "top performers"]):
        return get_top_gainers()



    for intent in intents["intents"]:
        if intent["tag"] == prediction:
            return random.choice(intent["responses"])

    return "Sorry, I don't understand that. Can you rephrase?"

# print("🤖 Crypto Chatbot is ready! Type 'quit' to exit.")
# while True:
#     user_input = input("You: ")
#     if user_input.lower() == "quit":
#         print("Bot: Goodbye 👋")
#         break
#     response = get_response(user_input)
#     print(f"Bot: {response}")





