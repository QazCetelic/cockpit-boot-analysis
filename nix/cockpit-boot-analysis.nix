{ config, lib, pkgs, ... }:

let
  cockpitSource = pkgs.fetchgit {
    url = "https://github.com/cockpit-project/cockpit.git";
    rev = "b9e161f26348265b57ac1b9fb2bf44147fb5b55c";
    hash = "sha256-J9WxNksRYDL9/HPq5OrBguRIZKLD0epVlAs90LhfCew=";
  };

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
      cp -r ${cockpitSource}/pkg/lib pkg/lib
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
