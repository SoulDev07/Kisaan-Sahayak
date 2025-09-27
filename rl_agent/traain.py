import random
from datetime import datetime, timedelta
from collections import deque
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import gym
from gym import spaces
import pymongo

# MongoDB Environment
class MongoDBEnv(gym.Env):
    def __init__(self, db_uri, db_name):
        super(MongoDBEnv, self).__init__()
        self.client = pymongo.MongoClient(db_uri)
        self.db = self.client[db_name]
        self.users_collection = self.db["users"]
        self.communications_collection = self.db["communications"]
        
        # Define action and observation space
        self.action_space = spaces.Discrete(3)  # Example: 3 possible actions
        self.observation_space = spaces.Box(low=0, high=1, shape=(10,), dtype=np.float32)  # Example: 10 features
        
    def reset(self):
        # Reset the state of the environment to an initial state
        self.current_state = self._get_current_state()
        return self.current_state
    
    def step(self, action):
        # Execute one time step within the environment
        reward = self._take_action(action)
        next_state = self._get_current_state()
        done = self._is_done()
        return next_state, reward, done, {}
    
    def _get_current_state(self):
        # Fetch current state from MongoDB
        today = datetime.now()
        start_of_day = today.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        # Example: Fetch some metrics from the database
        user_count = self.users_collection.count_documents({"last_login": {"$gte": start_of_day, "$lt": end_of_day}})
        comm_count = self.communications_collection.count_documents({"timestamp": {"$gte": start_of_day, "$lt": end_of_day}})
        
        # Normalize the state (example)
        state = np.array([user_count / 1000, comm_count / 500, 0, 0, 0, 0, 0, 0, 0, 0], dtype=np.float32)
        return state
    
    def _take_action(self, action):
        # Perform the action and calculate the reward
        # Example: Action 0: Do nothing, Action 1: Send notification, Action 2: Update settings
        if action == 1:
            # Send notification logic
            reward = 1
        elif action == 2:
            # Update settings logic
            reward = 0.5
        else:
            reward = 0
        return reward
    
    def _is_done(self):
        # Determine if the episode is done
        # Example: End of day
        return datetime.now().hour == 23 and datetime.now().minute >= 59

# Deep Q-Network (DQN)
class DQN(nn.Module):
    def __init__(self, input_dim, output_dim):
        super(DQN, self).__init__()
        self.fc1 = nn.Linear(input_dim, 128)
        self.fc2 = nn.Linear(128, 128)
        self.fc3 = nn.Linear(128, output_dim)
    
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)

# DQN Agent
class DQNAgent:
    def __init__(self, state_dim, action_dim, gamma=0.99, epsilon=1.0, epsilon_min=0.01, epsilon_decay=0.995, lr=0.001):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_min = epsilon_min
        self.epsilon_decay = epsilon_decay
        self.lr = lr
        
        self.model = DQN(state_dim, action_dim)
        self.optimizer = optim.Adam(self.model.parameters(), lr=lr)
        self.memory = deque(maxlen=10000)
    
    def remember(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))
    
    def act(self, state):
        if np.random.rand() <= self.epsilon:
            return random.randrange(self.action_dim)
        state = torch.FloatTensor(state)
        act_values = self.model(state)
        return torch.argmax(act_values).item()
    
    def replay(self, batch_size):
        if len(self.memory) < batch_size:
            return
        minibatch = random.sample(self.memory, batch_size)
        states = torch.FloatTensor(np.array([i[0] for i in minibatch]))
        actions = torch.LongTensor(np.array([i[1] for i in minibatch]))
        rewards = torch.FloatTensor(np.array([i[2] for i in minibatch]))
        next_states = torch.FloatTensor(np.array([i[3] for i in minibatch]))
        dones = torch.FloatTensor(np.array([i[4] for i in minibatch]))
        
        current_q = self.model(states).gather(1, actions.unsqueeze(1))
        next_q = self.model(next_states).detach().max(1)[0]
        target_q = rewards + (1 - dones) * self.gamma * next_q
        
        loss = nn.MSELoss()(current_q.squeeze(), target_q)
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

# Training Function
def train_agent(env, agent, episodes=1000, batch_size=32):
    for e in range(episodes):
        state = env.reset()
        total_reward = 0
        done = False
        while not done:
            action = agent.act(state)
            next_state, reward, done, _ = env.step(action)
            agent.remember(state, action, reward, next_state, done)
            state = next_state
            total_reward += reward
            if done:
                print(f"Episode: {e+1}/{episodes}, Total Reward: {total_reward}, Epsilon: {agent.epsilon:.2f}")
                break
            if len(agent.memory) > batch_size:
                agent.replay(batch_size)
    # Save the trained model
    torch.save(agent.model.state_dict(), "dqn_model.pth")
    print("Model saved to dqn_model.pth")

# Main Execution
if __name__ == "__main__":
    # Initialize environment and agent
    db_uri = "mongodb+srv://harshitbhanushali22:DmqjI9LFL3VHH5EC@cluster0.ywfh9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    db_name = "TCET2"
    env = MongoDBEnv(db_uri, db_name)
    agent = DQNAgent(state_dim=10, action_dim=3)
    
    # Train the agent
    train_agent(env, agent, episodes=1000)