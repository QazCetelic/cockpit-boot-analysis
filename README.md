# Cockpit Boot Analysis

Plugin that shows information about system / userspace startup in a graph.

![image](https://github.com/user-attachments/assets/b8d66778-53e9-485e-be6d-a4d00f96c9fa)


## Development setup

1. Installing dependencies

<details>
<summary>Debian/Ubuntu</summary>

```shell
sudo apt install gettext nodejs npm make
```

</details>

<details>
<summary>Fedora</summary>

```shell
sudo dnf install gettext nodejs npm make
```

</details>

2. Getting and building the source

These commands check out the source and build it into the `dist/` directory:

```
git clone https://github.com/QazCetelic/cockpit-boot-analysis.git
cd cockpit-boot-analysis
make
```

3. Running the plugin
 
Run the following commands to add the plugin to your local cockpit installation:
```
mkdir -p ~/.local/share/cockpit
ln -s ./dist ~/.local/share/cockpit/boot-analysis
```
Then run `make watch` to update the build on changes.
