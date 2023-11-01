import numpy as np

class RunningHistogram:
    def __init__(self, num_bins):
        self.num_bins = num_bins
        self.hist = np.zeros(num_bins)
        self.decay_factor = 0.9

    def process(self, value):
        self.hist = self.hist * self.decay_factor
        self.hist[value] += 1.0

    def get_histogram(self):
        return self.hist / np.sum(self.hist)

if __name__ == "__main__":
    num_bins = 12
    running_hist = RunningHistogram(num_bins)

    while True:
        try:
            user_input = int(input("Enter an integer (0-11) or 'q' to quit: "))
            
            if user_input == 'q':
                break
                
            if user_input < 0 or user_input > 11:
                print("Invalid input. Please enter an integer between 0 and 11.")
                continue

            running_hist.process(user_input)
            histogram = running_hist.get_histogram()

            print("Running Histogram:")
            for bin, count in enumerate(histogram):
                print(f"Bin {bin}: {'#' * int(count * 20)}")

        except ValueError:
            print("Invalid input. Please enter an integer between 0 and 11.")

    print("Exiting the program.")