import rawData from '../public/employment-data.json'

const processCategory = (category) =>
    Object.entries(category.index)
        .map(([id, index]) => ({
          id,
          label: category.label[id],
          index: parseInt(index)
        }))
        .sort((a, b) => a.index - b.index)

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

const getGenderTrend = (processedData) => (regionId, sectorId) =>
    processedData.quarters.map(quarter => {
      const distribution = getGenderDistribution(processedData)(regionId, sectorId, quarter.id)
      return {
        quarter: quarter.label,
        male: distribution.male,
        female: distribution.female,
        malePercentage: distribution.malePercentage,
        femalePercentage: distribution.femalePercentage
      }
    })

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

const getLatestQuarter = (processedData) =>
    processedData.quarters[processedData.quarters.length - 1].id

const testDataPoint = (processedData) => {
  const distribution = getGenderDistribution(processedData)("0", "3", "2024Q2")
  console.log("Test Data Point (Schweiz, Sektor 3, 2024Q2):")
  console.log(`Männer: ${distribution.male} (${distribution.malePercentage}%)`)
  console.log(`Frauen: ${distribution.female} (${distribution.femalePercentage}%)`)
  console.log(`Total: ${distribution.total}`)
}

const processedData = processData(rawData)

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