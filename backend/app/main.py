from langchain_community.callbacks import get_openai_callback
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from openai import AsyncOpenAI
from dotenv import load_dotenv
import uuid
import os
from agents import load_data, multi_dataframe_agent, model_pricing

load_dotenv()

app = FastAPI(
    title="Reem AI",
    description="Reem AI is a chatbot that can answer questions about properties and real estate in Abu Dhabi.",
    contact={
        "name": "Hamdan Mohammad",
        "url": "https://github.com/hamdan-27",
        "email": "hamdan102703@gmail.com"
    },
    docs_url="/reemai-docs",
    redoc_url=None
)

session_id = str(uuid.uuid4())

async_client = AsyncOpenAI(api_key=os.environ['OPENAI_API_KEY'])

config = {"configurable": {"session_id": session_id}}

# model = "gpt-4o"
# model = "gpt-4o-mini"
model = "claude-3-5-sonnet-20241022"
TEMPERATURE = 0.1

auh_sale_df = load_data("auh_sale.csv", dtypes_for='auh', date_col='Date', format='%d-%m-%Y')
auh_sale_df["Date"] = auh_sale_df["Date"].astype(str)
auh_rent_df = load_data("auh_rent.csv", dtypes_for='auh', date_col='Date', format='%d-%m-%Y')
auh_rent_df["Date"] = auh_rent_df["Date"].astype(str)

auh_agent = multi_dataframe_agent(
    model=model,
    temperature=TEMPERATURE,
    dfs=[auh_sale_df, auh_rent_df],
    verbose=True,
)

@app.get("/")
async def hello():
    return {"message": "Welcome to Reem AI API! Please navigate to the /reemai-docs"
            " endpoint for the chatbot API documentation."}


@app.get("/favicon.ico")
async def favicon():
    return FileResponse("favicon.ico")


@app.get("/chat/{message}")
async def send_message(message: str):
    print("\n[User]: ", message)
    try:
        with get_openai_callback() as cb:
            response = await auh_agent.ainvoke({"input": message}, config=config)
            print(
                f"Tokens Used: {cb.total_tokens}\n",
                f"\tPrompt Tokens: {cb.prompt_tokens}\n",
                f"\tCompletion Tokens: {cb.completion_tokens}\n",
                f"Successful Requests: {cb.successful_requests}\n",
                f"Total Cost (USD): ${cb.prompt_tokens*model_pricing[model]['input'] + cb.completion_tokens*model_pricing[model]['output']}\n",
            )
        if response["output"].endswith("```") or response["output"].endswith("'''"):
            response["output"] = response["output"][:-3]
        response_data = {
            'messages': {
                "role": "assistant",
                "content": response["output"]
            },
            'model': model,
            'temperature': TEMPERATURE,
            'total_tokens': cb.total_tokens,
            'total_cost_usd': cb.prompt_tokens*model_pricing[model]['input'] + cb.completion_tokens*model_pricing[model]['output']
        }

        return response_data

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
