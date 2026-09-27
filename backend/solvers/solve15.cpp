#include <algorithm>
#include <iostream>
#include <random>
#include <queue>
#include <iomanip>
#include <vector>
#include <list>
#include <chrono>
#include <ranges>
#include <unordered_map>
#include <unordered_set>
#include <climits>
using namespace std;

// all arrays are 0 indexed
// unless need be
// 0-15, 0 is empty

typedef uint64_t sqr;

static void visualize(const sqr input) {
    cout << "------------" << endl;
    for (int i = 0; i < 16; i++) {
        constexpr sqr mask = 15;
        const sqr val = ((mask << i * 4) & input) >> (i * 4);
        cout << std::setw(2) << val << " ";
        if (!((i + 1) % 4)) {
            cout << endl;
        }
    }
    cout << "------------" << endl;
}

static unordered_map<int, vector<pair<int, char> > > options; // 0 indexed <empty index, {<move, 'dir'>,}>


static void generate_table() {
    // new cost
    for (int i = 0; i < 16; i++) {
        vector opt = {i - 1, i + 1, i - 4, i + 4};
        vector move = {'r', 'l', 'd', 'u'};
        const int index = i + 1;
        if (!(index % 4)) {
            opt[1] = -1;
        }
        if (index % 4 == 1) {
            opt[0] = -1;
        }
        if (index <= 4) {
            opt[2] = -1;
        }
        if (index >= 13) {
            opt[3] = -1;
        }
        vector<pair<int, char> > res;
        for (int j = 0; j < 4; j++) {
            if (opt[j] == -1) {
                continue;
            }
            res.emplace_back(opt[j], move[j]);
        }
        options[i] = res;
    }
}

static vector<unordered_map<sqr, int> > pdb(3);

static void generate_pdb_table(const vector<sqr> &group, int index, sqr not_in_group) {
    const auto queue = new std::queue<tuple<sqr, int, unsigned> >();
    sqr start = 0;
    for (sqr i: group) {
        start |= (i << (i * 4));
    }
    queue->push(tuple<sqr, int, unsigned>{start, 0, 0});
    int count = 0;
    constexpr int magic = 524160;
    unordered_set<sqr> states;
    while (!queue->empty() && count < magic) {
        auto item = queue->front();
        queue->pop();
        auto board = get<sqr>(item);
        auto distance = get<int>(item);
        const auto empty_slot = get<unsigned>(item);
        auto board_es = board;
        sqr mask = not_in_group;
        board_es |= mask << (empty_slot * 4);

        if (states.contains(board_es)) {
            continue;
        }

        states.insert(board_es);
        if (!(pdb[index].contains(board))) {
            pdb[index].insert(pair<sqr, int>{board, distance});
            count = count + 1;
        }


        for (const auto key: options[empty_slot] | views::keys) {
            auto opt = key;
            auto next_distance = distance;
            mask = 15;
            if (mask << (opt * 4) & board) {
                // fringe tiles involved
                next_distance++;
            }

            mask = 15;
            mask = mask << 4 * opt;
            sqr new_board = board & (~mask);

            sqr val = board & mask;
            val = val >> 4 * opt;
            val = val << 4 * (empty_slot);
            new_board = new_board | val;

            queue->push(tuple<sqr, int, unsigned>{new_board, next_distance, opt});
        }
    }
}

static vector<sqr> group_a = {1, 2, 3, 5, 6};
static vector<sqr> group_b = {4, 8, 9, 12, 13};
static vector<sqr> group_c = {7, 10, 11, 14, 15};
static unordered_map<sqr, int> groups = {
    {1, 0},
    {2, 0},
    {3, 0},
    {5, 0},
    {6, 0},
    {4, 1},
    {8, 1},
    {9, 1},
    {12, 1},
    {13, 1},
    {7, 2},
    {10, 2},
    {11, 2},
    {14, 2},
    {15, 2},
};

static void generate_pdb() {
    generate_pdb_table(group_a, 0, 15);
    generate_pdb_table(group_b, 1, 1);
    generate_pdb_table(group_c, 2, 1);
}

static bool solvabilityQ(sqr input) {
    int N = 0;
    int row = 0;
    for (int i = 0; i <= 15; i++) {
        constexpr sqr mask = 15;
        sqr val = ((mask << i * 4) & input) >> (i*4);
        if (!val) {
            row = i / 4;
            continue;
        }
        for (int j = i; j <= 15; j++) {
            sqr val_after = ((mask << j * 4) & input) >> (j*4);
            if (val_after && val_after < val) {
                N++;
            }
        }
    }
    return !((N+row)%2);
}

/*
static sqr generate() {
    vector<int> input(16);
    for (int i = 0; i < 16; i++) {
        input[i] = i;
    }
    ranges::shuffle(input, std::default_random_engine{random_device{}()});
    sqr res = 0;
    for (int i = 0; i < 16; i++) {
        if (input[i] == 0) {
            continue;
        }
        res = res << 4;
        res += input[i];
    }
    return res << 4;
}
*/

/*
static int manhattan(const int current, const int goal) { // 0 indexed
    const int goalY = goal / 4;
    const int goalX = (goal % 4);
    const int curY = current / 4;
    const int curX = (current % 4);
    return (abs(goalX - curX) + abs(goalY - curY));
}
*/

static int estimate(const sqr input) {
    sqr a = 0, b = 0, c = 0;
    for (int i = 0; i < 16; i++) {
        constexpr sqr mask = 15;
        const sqr val_wp = mask << (i * 4) & input;
        sqr val = val_wp >> (i * 4);
        if (!val) {
            continue;
        }
        if (groups[val] == 0) {
            a |= val_wp;
        } else if (groups[val] == 1) {
            b |= val_wp;
        } else {
            c |= val_wp;
        }
    }
    return pdb[0][a] + pdb[1][b] + pdb[2][c];
}

static void DFS(const sqr input, vector<char> &moves, int &g, int &h, const int &threshold, int &excess,
                const int empty_slot, int &dora) {
    dora++;
    if (!h) {
        // visualize(input);
        return;
    }

    if (g + h > threshold) {
        excess = min(g + h - threshold, excess);
        return;
    }

    for (auto [fst, snd]: options[empty_slot]) {
        const auto opt = fst;
        char next_move = snd;
        if (!moves.empty() && ((next_move == 'r' && moves.back() == 'l')
                               || (next_move == 'l' && moves.back() == 'r')
                               || (next_move == 'u' && moves.back() == 'd')
                               || (next_move == 'd' && moves.back() == 'u'))) {
            continue;
        }

        sqr mask = 15;
        mask = mask << 4 * opt;
        sqr new_input = input & (~mask);

        sqr val = input & mask;
        val = val >> 4 * opt;
        val = val << 4 * (empty_slot);
        new_input = new_input | val;

        moves.push_back(next_move);
        g++;

        mask = 15;
        mask = mask << 4 * opt;

        const auto _h = h;
        h = estimate(new_input);


        DFS(new_input, moves, g, h, threshold, excess, opt, dora);
        if (!h) {
            // visualize(new_input);
            return;
        }
        h = _h;
        g--;
        moves.pop_back();
    }
}

int main() {
    generate_table();
    generate_pdb();
    string line; // expect number space number
    while (getline(cin, line)) {
        if (line.empty()) {
            continue;
        }

        sqr board = 0;
        string cell;
        stringstream ss(line);


        int i = 0;
        bool valid = true;
        unordered_set<sqr> values;
        int emply_slot = 0;
        while (ss >> cell) {
            if (i > 15) {
                valid = false;
                break;
            }
            const sqr val = atoi(cell.c_str());
            if (val < 0 || val > 15) {
                valid = false;
                break;
            }
            if (values.contains(val)) {
                valid = false;
                break;
            }

            if (val == 0) {
                emply_slot = i;
            }

            values.insert(val);
            board |= val << (i*4);
            i++;
        }

        if (!valid) {
            cout << "INVALID INPUT" << endl;
            cout << flush;
            continue;
        }

        if (i!=16) {
            cout << "INVALID INPUT" << endl;
            cout << flush;
            continue;
        }

        if (!solvabilityQ(board)) {
            cout << "UNSOLVABLE" << endl;
            cout << flush;
            continue;
        }

        int excess = INT_MAX;
        int cost_ref = estimate(board);
        int threshold = estimate(board);
        int dora = 0;
        vector<char> moves = {};
        int g = 0;
        int h = cost_ref;

        int k = 0;
        while (k < 30) {
            k++;
            DFS(board, moves, g, h, threshold, excess, emply_slot, dora);
            if (!moves.empty()) {
                for (auto move: moves) {
                    cout << move;
                }
                cout << endl;
                cout << flush;
                break;
            }
            g = 0;
            h = cost_ref;
            moves.clear();
            if (INT_MAX == excess) {
                continue;
            }
            threshold += excess;
            excess = INT_MAX;
        }
    }
}
