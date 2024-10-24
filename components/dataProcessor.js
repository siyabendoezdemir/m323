import rawData from '../public/employment-data.json'

//erstellt und sortiert die verschiedenen Kategorien in einen Array aus Objekten
// -> vereinfacht den späteren Zugriff auf label und index
const processCategory = (category) =>
    Object.entries(category.index)
        .map(([id, index]) => ({
          id,
          label: category.label[id],
          index: parseInt(index)
        }))
        .sort((a, b) => a.index - b.index)


//restrukturiert die rohen Daten in ein besser zugängliches Objekt
//erstellt strukturierte Objekte für die verschiedenen Kategorien (mit processCategory-Funktion)
//extrahiert die Werte in ein eigenes Sub-Objekt
//legt die Dimensionsgrösse jeder Kategorie fest
const processData = (data) => {
  const { dataset } = data
  const { Grossregion, Wirtschaftssektor, Geschlecht, Quartal } = dataset.dimension

  return {
    regions: processCategory(Grossregion.category),
    sectors: processCategory(Wirtschaftssektor.category),
    genders: processCategory(Geschlecht.category),
    quarters: processCategory(Quartal.category),
    employmentData: dataset.value,
    dimensions: {
      regionsCount: Object.keys(Grossregion.category.index).length,
      sectorsCount: Object.keys(Wirtschaftssektor.category.index).length,
      gendersCount: Object.keys(Geschlecht.category.index).length,
      quartersCount: Object.keys(Quartal.category.index).length
    }
  }
}
//Funktion zur Berechnung des ein-dimensionalen Indexes der den Datenpunkt des (theoretisch) vier-dimensionalen Arrays repräsentiert
const getIndex = (processedData, regionId, sectorId, genderId, quarterId) => {
  const { Grossregion, Wirtschaftssektor, Geschlecht, Quartal } = rawData.dataset.dimension
  const { sectorsCount, gendersCount, quartersCount } = processedData.dimensions

  const regionIndex = parseInt(Grossregion.category.index[regionId])
  const sectorIndex = parseInt(Wirtschaftssektor.category.index[sectorId])
  const genderIndex = parseInt(Geschlecht.category.index[genderId])
  const quarterIndex = parseInt(Quartal.category.index[quarterId])

  return (
      regionIndex * sectorsCount * gendersCount * quartersCount +
      sectorIndex * gendersCount * quartersCount +
      genderIndex * quartersCount +
      quarterIndex
  )
}

//Curried-Function -> processedData muss nicht bei jedem Aufruf mitgegeben werden
//gibt die Geschlechterverteilung einem bestimmten Quartal eines bestimmten Sektors in einer bestimmten Region zurück
//Rückgabe der Werte und Prozentsätze für Männer und Frauen und das Total
const getGenderDistribution = (processedData) => (regionId, sectorId, quarterId) => {
  const maleIndex = getIndex(processedData, regionId, sectorId, "1", quarterId)
  const femaleIndex = getIndex(processedData, regionId, sectorId, "2", quarterId)

  const maleValue = processedData.employmentData[maleIndex] || 0
  const femaleValue = processedData.employmentData[femaleIndex] || 0

  const total = maleValue + femaleValue

  return {
    male: maleValue,
    female: femaleValue,
    malePercentage: total > 0 ? (maleValue / total * 100).toFixed(1) : '0.0',
    femalePercentage: total > 0 ? (femaleValue / total * 100).toFixed(1) : '0.0',
    total
  }
}

//Curried-Funktion -> processedData muss nicht bei jedem Aufruf mitgegeben werden
//gibt den Trend der Geschlechterverteilung für einen bestimmten Sektor in einer Region zurück
//ruft für jedes Quartal getGenderDistribution auf
const getGenderTrend = (processedData) => (regionId, sectorId) =>
    processedData.quarters.reduce((trend, quarter) => {
        const distribution = getGenderDistribution(processedData)(regionId, sectorId, quarter.id)
        trend.push({
            quarter: quarter.label,
            male: distribution.male,
            female: distribution.female,
            malePercentage: distribution.malePercentage,
            femalePercentage: distribution.femalePercentage
        })
        return trend
    }, [])

//Curried-Funktion -> processedData muss nicht bei jedem Aufruf mitgegeben werden
//gibt die Geschlechterverteilung der Sektoren von einem bestimmten Quartal in einer Region zurück
const getSectorComparison = (processedData) => (regionId, quarterId) =>
    processedData.sectors
        .filter(sector => sector.id !== 'TOT')
        .map(sector => {
          const distribution = getGenderDistribution(processedData)(regionId, sector.id, quarterId)
          return {
            sector: sector.label,
            malePercentage: distribution.malePercentage,
            femalePercentage: distribution.femalePercentage,
            total: distribution.total
          }
        })

//gibt die ID des neusten Quartals zurück
const getLatestQuarter = (processedData) =>
    processedData.quarters[processedData.quarters.length - 1].id

//Testfunktion -> rückgabe eines bestimmten Datensatzes
const testDataPoint = (processedData) => {
  const distribution = getGenderDistribution(processedData)("0", "3", "2024Q2")
  console.log("Test Data Point (Schweiz, Sektor 3, 2024Q2):")
  console.log(`Männer: ${distribution.male} (${distribution.malePercentage}%)`)
  console.log(`Frauen: ${distribution.female} (${distribution.femalePercentage}%)`)
  console.log(`Total: ${distribution.total}`)
}

//Funktionsaufruf (Konstruktor) der processData-Funktion
const processedData = processData(rawData)

//Objekterstellung mit allen Funktionen
const dataProcessor = {
  getRegions: () => processedData.regions,
  getSectors: () => processedData.sectors,
  getQuarters: () => processedData.quarters,
  getGenderDistribution: getGenderDistribution(processedData),
  getGenderTrend: getGenderTrend(processedData),
  getSectorComparison: getSectorComparison(processedData),
  getLatestQuarter: () => getLatestQuarter(processedData),
  testDataPoint: () => testDataPoint(processedData)
}

export default dataProcessor