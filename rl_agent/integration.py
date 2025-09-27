from flask import Flask, request, jsonify
import torch
import gym
from gym import spaces
import numpy as np
import pymongo
from datetime import datetime, timedelta
# General Imports
import random
from datetime import datetime, timedelta
from collections import deque

# MongoDB Imports
import pymongo

# Flask Imports
from flask import Flask, request, jsonify

# Gym (Reinforcement Learning) Imports
import gym
from gym import spaces

# NumPy and PyTorch Imports
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
# Scheduling Imports (for daily updates)
import schedule
import time
from flask_cors import CORS
from .deepQ_learn import DQNAgent
app = Flask(__name__)
CORS(app)
import os
from dotenv import load_dotenv
from .environment import MongoDBEnv  # Adjust this import based on your actual module

# Load environment variables from .env file
load_dotenv()

# Get MongoDB credentials from environment variables
mongo_uri = os.getenv("MONGODB_URI")
database_name = os.getenv("MONGODB_DB")

# Initialize MongoDB environment
env = MongoDBEnv(mongo_uri, database_name)

# Initialize the DQN agent
agent = DQNAgent(state_dim=10, action_dim=3)

# Load trained model (assuming you have a trained model)
agent.model.load_state_dict(torch.load("dqn_model.pth"))
agent.model.eval()

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    state = np.array(data['state'], dtype=np.float32)
    action = agent.act(state)
    return jsonify({"action": int(action)})

import schedule
import time

def daily_update():
    # Fetch new data from MongoDB and update the RL agent
    state = env.reset()
    # You can retrain the agent with new data if needed
    # train_agent(env, agent, episodes=1)

schedule.every().day.at("00:00").do(daily_update)

while True:
    schedule.run_pending()
    time.sleep(1)

if __name__ == '__main__':
    app.run(port=5004)