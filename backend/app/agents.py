from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_experimental.tools.python.tool import PythonAstREPLTool
from langchain.agents.agent import AgentExecutor, RunnableAgent
from langchain.agents import AgentExecutor #, load_tools
from langchain_core.prompts import PromptTemplate
from langchain.agents import create_react_agent
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from typing import Optional, List
from dotenv import load_dotenv
import pandas as pd
import os
from prompts import (
    FORMAT_INSTRUCTIONS, 
    FORMAT_INSTRUCTIONS_2,
    ABUDHABI_PREFIX, 
    MULTI_DF_SUFFIX
)
from sessions import SessionStore


model_pricing = {
    "gpt-3.5-turbo": {
        "input": 0.0000005,
        "output": 0.0000015,
    },
    "gpt-4": {
        "input": 0.00003,
        "output": 0.00006,
    },
    "gpt-4-turbo": {
        "input": 0.00001,
        "output": 0.00003,
    },
    "gpt-4o": {
        "input": 0.000005,
        "output": 0.000015,
    },
    "claude-3-5-sonnet-20241022": {
        "input": 0.000003,
        "output": 0.000015,
    }
}

# load local .env when running locally
load_dotenv(".env")

def load_data(
        filename: str, 
        date_col: Optional[str] = None, 
        format: Optional[str] = None
    ) -> pd.DataFrame: 
    """
    Load data from a CSV file and convert the 'Date' column to datetime format if present.

    Parameters:
        filename (str): The name of the CSV file to load.
        date_col (Optional[str]): The name of the column containing the date. Defaults to None.
        format (Optional[str]): The format of the date column if present. Defaults to None.

    Returns:
        pd.DataFrame: The loaded data as a pandas DataFrame.
    """
    dtypes = {
        'Date': 'string',
        'Average Sales Price (AED/Sqf)': float, 
        'Location': 'string', 
        'M-o-m Change ( % )': float, 
        'Q-o-q Change (%)': float, 
        'Y-o-y Change (%)': float
    }
    df = pd.read_csv(f"data/{filename}", dtype=dtypes)
    if date_col is not None:
        df[date_col] = pd.to_datetime(df[date_col], format=format).dt.date
    return df

pd.set_option('display.max_columns', None)

session_store = SessionStore()

def get_or_create_session_history(session_id: str) -> ChatMessageHistory:
    # print("Session ID in function:", session_id)
    history = session_store.get_session_history(session_id)
    if history is None:
        history = session_store.create_session_history(session_id)
    return history


def multi_dataframe_agent(
    model,
    temperature: float,
    dfs: List[pd.DataFrame],
    prefix: str = ABUDHABI_PREFIX,
    verbose: bool = False,
    chat_history=get_or_create_session_history,
    return_intermediate_steps: bool = False,
    max_iterations: int = 15,
    max_execution_time=None,
    early_stopping_method: str = "force",
    agent_executor_kwargs=None,
) -> RunnableWithMessageHistory:
    """ 
    Creates an agent that can interact with a Pandas DataFrame using natural language.

    Parameters:
        model (str): OpenAI model to use.
        temperature (float): The temperatureof the model.
        dfs (List[pd.DataFrame]): The DataFrames to interact with.
        prefix (str, optional): The prefix to use for the agent. Defaults to ABUDHABI_PREFIX.
        verbose (bool, optional): Whether to print debug information. Defaults to False.
        chat_history (function, optional): A function that returns the chat history. Defaults to get_session_history.
        return_intermediate_steps (bool, optional): Whether to return intermediate steps. Defaults to False.
        max_iterations (int, optional): The maximum number of iterations. Defaults to 15.
        max_execution_time (float, optional): The maximum execution time in seconds. Defaults to None.
        early_stopping_method (str, optional): The early stopping method. Defaults to "force".
        agent_executor_kwargs (dict, optional): Additional keyword arguments for the agent executor. Defaults to None.

    Returns:
        RunnableWithMessageHistory: An agent that can interact with a Pandas DataFrame using natural language.
    """
    for _df in dfs if isinstance(dfs, list) else [dfs]:
        if not isinstance(_df, pd.DataFrame):
            raise ValueError(f"Expected pandas DataFrame, got {type(_df)}")

    df_locals = {}
    for i, dataframe in enumerate(dfs):
        df_locals[f"df{i + 1}"] = dataframe
    
    tools = [PythonAstREPLTool(locals=df_locals)]

    template = "\n\n".join(
        [prefix, "{tools}", FORMAT_INSTRUCTIONS_2, MULTI_DF_SUFFIX])
    prompt = PromptTemplate.from_template(template)

    partial_prompt = prompt.partial()
    if "dfs_head" in partial_prompt.input_variables:
        dfs_head = "\n\n".join(
            [d.head(5).to_markdown() for d in dfs])
        partial_prompt = partial_prompt.partial(dfs_head=dfs_head)
    if "num_dfs" in partial_prompt.input_variables:
        partial_prompt = partial_prompt.partial(num_dfs=str(len(dfs)))

    agent = RunnableAgent(
        runnable=create_react_agent(
            # ChatOpenAI(model=model, temperature=temperature),
            ChatAnthropic(model=model, temperature=temperature,
                          api_key=os.environ['ANTHROPIC_API_KEY']),
            tools, partial_prompt),
        input_keys_arg=["input"],
        return_keys_arg=["output"],
    )

    agent_excecutor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=verbose,
        return_intermediate_steps=return_intermediate_steps,
        max_iterations=max_iterations,
        max_execution_time=max_execution_time,
        early_stopping_method=early_stopping_method,
        handle_parsing_errors=True,
        **(agent_executor_kwargs or {}),
    )

    return RunnableWithMessageHistory(
        agent_excecutor,
        get_session_history=chat_history,
        input_messages_key="input",
        history_messages_key="chat_history"
    )
