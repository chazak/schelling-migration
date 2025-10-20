
all: $(wildcard *.cpp)
	clang++ -fsanitize=address -O0 -g -std=c++23 -Ithirdparty/raylib/src -Wall -Werror -lm -o  schelling $^ ./libs/libraylib.a

run: all
	./schelling
