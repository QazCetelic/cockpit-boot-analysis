{ config, lib, pkgs, ... }:

let
  package = pkgs.buildNpmPackage {
    pname = "cockpit-boot-analysis";
    version = "unstable";

    src = ../.;

    npmDepsHash = "sha256-sG+D9uFBnQAzRON//DNryGGgFQQA3U4fBmiu/gWLFdY=";
    npmFlags = [ "--legacy-peer-deps" ];

    nativeBuildInputs = [ pkgs.gettext ];

    postPatch = ''
      patchShebangs build.js
      mkdir -p pkg
      cp -r ${pkgs.cockpit.src}/pkg/lib pkg/lib
    '';

    installPhase = ''
      runHook preInstall
      install -d "$out/share/cockpit/boot-analysis"
      cp -r dist/* "$out/share/cockpit/boot-analysis/"
      runHook postInstall
    '';

    meta = {
      description = "Cockpit plugin showing system and userspace startup information";
      homepage = "https://github.com/QazCetelic/cockpit-boot-analysis";
      license = lib.licenses.gpl3Plus;
      platforms = lib.platforms.linux;
    };
  };
in
{
  config = lib.mkIf config.services.cockpit.enable {
    environment.systemPackages = [ package ];
  };
}
